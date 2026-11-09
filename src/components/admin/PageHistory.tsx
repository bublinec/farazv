"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentRecordFor } from "@/content/documents";
import type { PageRevision } from "@/content/page-documents";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import { readAdminJson } from "./admin-api";
import { formatAdminTimestamp } from "./admin-format";
import styles from "./Admin.module.css";

const actionLabels: Record<PageRevision["action"], string> = {
  save: "Uložené",
  publish: "Zverejnené",
  unpublish: "Stiahnuté z webu",
  restore: "Obnovená staršia verzia"
};

/**
 * Every save of a page is kept. Restoring writes that version back like a
 * save: a page already on the web shows it immediately.
 */
export function PageHistory({
  record,
  builtIn,
  dirty,
  busy,
  onRestored,
  onShowCodeVersion
}: {
  record: ContentRecordFor<"page">;
  builtIn: boolean;
  dirty: boolean;
  busy: boolean;
  onRestored: () => Promise<void>;
  onShowCodeVersion: () => void;
}) {
  const [revisions, setRevisions] = useState<PageRevision[] | null>(null);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setRevisions(
        await readAdminJson(
          await fetch(
            `/api/admin/records/${encodeURIComponent(record.id)}/revisions`,
            { cache: "no-store" }
          ),
          "Históriu sa nepodarilo načítať."
        )
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Históriu sa nepodarilo načítať."
      );
    }
  }, [record.id]);

  // Reload after each successful write, which changes the record version.
  useEffect(() => {
    void load();
  }, [load, record.version]);

  async function restore(revision: PageRevision, index: number) {
    const consequence = record.published
      ? "Stránka je zverejnená, takže sa táto verzia hneď zobrazí na webe."
      : "Stránka nie je zverejnená; verzia sa obnoví iba v koncepte.";
    if (
      !window.confirm(
        `Obnoviť verziu z ${formatAdminTimestamp(
          revision.createdAt
        )}? ${consequence}`
      )
    )
      return;

    setRestoring(revision.id);
    setError("");
    try {
      await readAdminJson(
        await fetch(
          `/api/admin/records/${encodeURIComponent(
            record.id
          )}/revisions/${encodeURIComponent(revision.id)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ version: record.version })
          }
        ),
        `Obnovenie verzie ${index + 1} sa nepodarilo.`
      );
      await onRestored();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Obnovenie zlyhalo."
      );
    } finally {
      setRestoring("");
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="page-history-heading">
      <h2 id="page-history-heading">História a návrat</h2>
      {builtIn ? (
        <div className={styles.notice}>
          {record.published ? (
            <>
              <p>
                Na webe je zverejnená verzia z administrácie. Ak ju vypnete, na
                webe sa znova zobrazí pôvodná verzia z kódu. Táto úprava a jej
                história ostanú uložené.
              </p>
              <button
                type="button"
                className={styles.secondary}
                disabled={busy || dirty}
                onClick={() => {
                  if (
                    window.confirm(
                      "Vrátiť na webe pôvodnú verziu z kódu? Úprava ostane uložená ako koncept."
                    )
                  )
                    onShowCodeVersion();
                }}
              >
                Vrátiť web na pôvodnú verziu z kódu
              </button>
            </>
          ) : (
            <p>
              Na webe sa teraz zobrazuje pôvodná verzia z kódu. Vaše úpravy sa
              ukážu až po zverejnení.
            </p>
          )}
        </div>
      ) : null}
      {dirty ? (
        <p className={styles.hint}>
          Pred obnovením staršej verzie zmeny uložte alebo ich zahoďte.
        </p>
      ) : null}
      {error ? (
        <div className={styles.error} role="alert">
          {error}
          <TechnicalSupport />
        </div>
      ) : null}
      {revisions === null && !error ? (
        <p role="status">Načítavam históriu…</p>
      ) : null}
      {revisions?.length ? (
        <ol className={styles.recordList}>
          {revisions.map((revision, index) => (
            <li key={revision.id} className={styles.record}>
              <div className={styles.recordCopy}>
                <strong>
                  {actionLabels[revision.action]}
                  {index === revisions.length - 1
                    ? builtIn
                      ? " · pôvodná verzia z kódu"
                      : " · vytvorenie"
                    : ""}
                </strong>
                <small>
                  {formatAdminTimestamp(revision.createdAt)} · {revision.actor}{" "}
                  · verzia {revision.version}
                </small>
              </div>
              {index > 0 ? (
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={busy || dirty || !!restoring}
                  onClick={() => void restore(revision, index)}
                >
                  {restoring === revision.id ? "Obnovujem…" : "Obnoviť"}
                </button>
              ) : (
                <small>Aktuálna verzia</small>
              )}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
