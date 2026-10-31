"use client";

import Link from "next/link";
import { useState } from "react";
import type { ContentRecord } from "@/content/documents";
import { isPostKind, postKindLabels } from "@/content/posts";
import { publicRecordPath } from "@/lib/record-routing";
import { RecordForm } from "./RecordForm";
import {
  useRecordEditor,
  type RecordEditorOperation
} from "./hooks/useRecordEditor";
import styles from "./Admin.module.css";

const operationLabels: Record<
  Exclude<RecordEditorOperation, "idle">,
  string
> = {
  saving: "Ukladám alebo načítavam…",
  publishing: "Zverejňujem…",
  unpublishing: "Sťahujem z webu…",
  reloading: "Ukladám alebo načítavam…",
  refreshing: "Ukladám alebo načítavam…"
};

function editorStatus(
  operation: RecordEditorOperation,
  dirty: boolean,
  message: string
) {
  if (operation !== "idle") return operationLabels[operation];
  if (dirty) return "● Máte neuložené zmeny";

  return message || "Všetky zmeny sú uložené.";
}

export function RecordEditor({
  initialRecord
}: {
  initialRecord: ContentRecord;
}) {
  const {
    record,
    setRecord,
    operation,
    busy,
    dirty,
    error,
    message,
    conflict,
    cacheWarning,
    saveRecord,
    publishRecord,
    unpublishRecord,
    retryCacheRefresh,
    reloadLatest,
    preview
  } = useRecordEditor(initialRecord);
  const [formBusy, setFormBusy] = useState(false);
  const editorBusy = busy || formBusy;
  const publicPath = publicRecordPath(record);

  return (
    <>
      <div className={styles.heading}>
        <div>
          {record.kind !== "settings" ? (
            <Link
              href={
                record.kind === "bulletin"
                  ? "/admin"
                  : `/admin?section=${
                      isPostKind(record.kind) ? "posts" : "article"
                    }`
              }
              className={styles.hint}
            >
              ←{" "}
              {record.kind === "bulletin"
                ? "Oznamy"
                : isPostKind(record.kind)
                ? "Príspevky"
                : "Články"}
            </Link>
          ) : null}
          <h1 style={{ marginTop: record.kind === "settings" ? 0 : ".8rem" }}>
            {record.kind === "settings"
              ? "Nastavenia farnosti"
              : record.title || "Nový koncept"}
          </h1>
          {isPostKind(record.kind) ? (
            <p>{postKindLabels[record.kind]}</p>
          ) : null}
        </div>
        <span
          className={`${styles.badge} ${
            record.published ? styles.published : ""
          }`}
        >
          {record.published ? "Zverejnené" : "Koncept"}
        </span>
      </div>
      {record.readOnly ? (
        <div className={styles.notice}>
          <strong>História · iba na čítanie.</strong> Tento importovaný záznam
          sa uchováva v pôvodnej podobe vrátane nezrovnalostí. Nemá verejnú
          archívnu stránku a nie je možné ho upraviť ani znova zverejniť.
        </div>
      ) : null}
      {record.source?.anomalies?.length ? (
        <div className={styles.notice}>
          <strong>Poznámky k importu</strong>
          <ul>
            {record.source.anomalies.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!formBusy) void saveRecord();
        }}
      >
        <div className={styles.grid}>
          <div>
            <fieldset
              className={styles.disabled}
              disabled={editorBusy || record.readOnly}
              aria-label="Obsah záznamu"
            >
              <RecordForm
                record={record}
                onChange={setRecord}
                disabled={record.readOnly || busy}
                onBusyChange={setFormBusy}
              />
            </fieldset>
          </div>
          <aside className={styles.sidebar}>
            <section className={styles.panel}>
              <h2>{record.readOnly ? "Záznam" : "Uložiť a zverejniť"}</h2>
              {error ? (
                <div className={styles.error} role="alert">
                  {error}
                  {conflict ? (
                    <p>
                      Obsah medzitým zmenil iný editor. Vaše hodnoty zostali vo
                      formulári. Pred načítaním aktuálnej verzie si ich
                      porovnajte alebo skopírujte.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {cacheWarning ? (
                <div className={styles.notice} role="alert">
                  <strong>Obsah je uložený, obnovenie webu čaká.</strong>
                  <p>{cacheWarning}</p>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={editorBusy}
                    onClick={() => void retryCacheRefresh()}
                  >
                    Zopakovať obnovenie webu
                  </button>
                </div>
              ) : null}
              <p className={styles.status} role="status" aria-live="polite">
                {formBusy
                  ? "Otváram týždeň oznamov…"
                  : editorStatus(operation, dirty, message)}
              </p>
              <div className={styles.actions}>
                {!record.readOnly ? (
                  <>
                    <button
                      className={styles.secondary}
                      type="submit"
                      disabled={editorBusy}
                    >
                      Uložiť koncept
                    </button>
                    <button
                      className={styles.quietLink}
                      type="button"
                      disabled={editorBusy}
                      onClick={() => void preview()}
                    >
                      {dirty ? "Uložiť a otvoriť náhľad" : "Súkromný náhľad"}
                    </button>
                    <button
                      className={styles.button}
                      type="button"
                      disabled={editorBusy}
                      onClick={() => void publishRecord()}
                    >
                      {record.published ? "Zverejniť zmeny" : "Zverejniť"}
                    </button>
                  </>
                ) : (
                  <Link
                    className={styles.secondary}
                    href={`/admin/preview/${encodeURIComponent(record.id)}`}
                  >
                    Súkromný náhľad histórie
                  </Link>
                )}
                {conflict ? (
                  <button
                    className={styles.secondary}
                    type="button"
                    disabled={editorBusy}
                    onClick={() => void reloadLatest()}
                  >
                    Načítať aktuálnu verziu
                  </button>
                ) : null}
              </div>
              {publicPath && !record.readOnly ? (
                <p>
                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.kind === "bulletin"
                      ? "Otvoriť aktuálne verejné oznamy ↗"
                      : "Otvoriť verejnú stránku ↗"}
                  </a>
                </p>
              ) : null}
              {!record.readOnly ? (
                <p className={styles.hint}>
                  Uloženie konceptu nemení verejný web.
                </p>
              ) : null}
              <details className={styles.disclosure}>
                <summary>Viac možností</summary>
                {record.published &&
                !record.readOnly &&
                record.kind !== "settings" ? (
                  <button
                    className={styles.danger}
                    type="button"
                    disabled={editorBusy}
                    onClick={() => void unpublishRecord()}
                  >
                    Stiahnuť z webu
                  </button>
                ) : null}
                <p className={styles.hint}>
                  Verzia {record.version}
                  <br />
                  Posledná úprava:{" "}
                  {new Intl.DateTimeFormat("sk-SK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Europe/Bratislava"
                  }).format(new Date(record.updatedAt))}
                </p>
                {record.kind === "bulletin" ? (
                  <p className={styles.hint}>
                    Budúci zverejnený týždeň sa aktivuje podľa dátumu. Neskoršia
                    úprava starého týždňa z neho neurobí aktuálny.
                  </p>
                ) : null}
                {record.source ? (
                  <p>
                    Zdroj: {record.source.kind} #{record.source.id}
                    <br />
                    Import: {record.source.importedVersion}
                    <br />
                    Pôvodne zverejnené: {record.source.publishedAt ?? "nie"}
                  </p>
                ) : null}
              </details>
            </section>
          </aside>
        </div>
      </form>
    </>
  );
}
