"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import type { ContentRecord } from "@/content/documents";
import { isPostRecordKind } from "@/content/posts";
import { publicRecordPath } from "@/lib/record-routing";
import { RecordForm } from "./RecordForm";
import { RecordLivePreview } from "./RecordLivePreview";
import { EditorValidation } from "./EditorValidation";
import { useAdminSection } from "./AdminSectionContext";
import { hasUnpublishedChanges, recordStateLabel } from "./record-state";
import {
  useRecordEditor,
  type RecordEditorOperation
} from "./hooks/useRecordEditor";
import styles from "./Admin.module.css";
import layout from "./RecordEditor.module.css";

const operationLabels: Record<
  Exclude<RecordEditorOperation, "idle">,
  string
> = {
  saving: "Ukladám…",
  publishing: "Zverejňujem…",
  unpublishing: "Sťahujem z webu…",
  reloading: "Načítavam…",
  refreshing: "Obnovujem web…"
};

const timestampFormatter = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Bratislava"
});

function RecordTimestamp({ value }: { value: string | null }) {
  return value ? (
    <time dateTime={value}>{timestampFormatter.format(new Date(value))}</time>
  ) : (
    <>Neznáme</>
  );
}

function focusInvalidField(form: HTMLFormElement | null, path: string) {
  if (!form || !path) return;

  const field = Array.from(form.querySelectorAll<HTMLElement>("[data-field]"))
    .filter((element) => {
      const candidate = element.dataset.field;
      return (
        candidate === path || (candidate && path.startsWith(`${candidate}.`))
      );
    })
    .sort(
      (left, right) =>
        (right.dataset.field?.length ?? 0) - (left.dataset.field?.length ?? 0)
    )[0];
  if (!field) return;

  let ancestor: HTMLElement | null = field;
  while (ancestor) {
    if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
    ancestor = ancestor.parentElement;
  }
  field.scrollIntoView({ block: "center", behavior: "smooth" });
  field
    .querySelector<HTMLElement>(
      "input, select, textarea, [contenteditable=true], button"
    )
    ?.focus({ preventScroll: true });
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
    errorField,
    message,
    conflict,
    cacheWarning,
    saveRecord,
    setPublished,
    retryCacheRefresh,
    reloadLatest
  } = useRecordEditor(initialRecord);
  const [formBusy, setFormBusy] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const editorBusy = busy || formBusy;
  const isSettings = record.kind === "settings";
  const publicPath = publicRecordPath(record);
  const unpublishedChanges = hasUnpublishedChanges(record);
  const stateLabel = recordStateLabel(record);
  const needsSave =
    dirty || unpublishedChanges || (isSettings && !record.published);
  const mustSaveBeforePublishing = !record.published && dirty;
  useAdminSection(record.kind);

  useEffect(() => {
    if (!error) return;
    setPreviewMode(false);
    if (!errorField)
      errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    const frame = requestAnimationFrame(() =>
      focusInvalidField(formRef.current, errorField)
    );
    return () => cancelAnimationFrame(frame);
  }, [error, errorField]);

  const status = formBusy
    ? "Načítavam dokument alebo týždeň…"
    : operation !== "idle"
    ? operationLabels[operation]
    : dirty
    ? "Neuložené zmeny"
    : message || (isSettings ? "Uložené" : stateLabel);

  return (
    <div className={layout.workspace}>
      <div className={styles.heading}>
        <div>
          {!isSettings ? (
            <Link
              className={styles.hint}
              href={
                record.kind === "bulletin"
                  ? "/admin"
                  : `/admin?section=${
                      isPostRecordKind(record.kind) ? "posts" : "article"
                    }`
              }
            >
              ←{" "}
              {record.kind === "bulletin"
                ? "Oznamy"
                : isPostRecordKind(record.kind)
                ? "Výveska"
                : "Naše spoločenstvo"}
            </Link>
          ) : null}
          <h1 className={isSettings ? undefined : layout.recordTitle}>
            {isSettings
              ? "Nastavenia farnosti"
              : record.title || "Nový koncept"}
          </h1>
        </div>
      </div>

      {record.readOnly ? (
        <div className={styles.notice}>Historický záznam · iba na čítanie.</div>
      ) : null}
      {record.source?.anomalies?.length ? (
        <details className={styles.disclosure}>
          <summary>
            Poznámky k pôvodnému importu ({record.source.anomalies.length})
          </summary>
          <ul>
            {record.source.anomalies.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!editorBusy && needsSave) void saveRecord();
        }}
      >
        {error ? (
          <div ref={errorRef} className={styles.error} role="alert">
            {error}
            {!errorField && !conflict ? <TechnicalSupport /> : null}
            {errorField ? (
              <button
                type="button"
                className={styles.quietLink}
                onClick={() => {
                  setPreviewMode(false);
                  requestAnimationFrame(() =>
                    focusInvalidField(formRef.current, errorField)
                  );
                }}
              >
                Prejsť na pole →
              </button>
            ) : null}
            {conflict ? (
              <p>
                Iný editor uložil novšiu verziu. Vaše zmeny zostali vo
                formulári.
              </p>
            ) : null}
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
        ) : null}
        {cacheWarning ? (
          <div className={styles.notice} role="alert">
            <strong>Obsah je uložený, obnovenie webu čaká.</strong>
            <p>{cacheWarning}</p>
            <TechnicalSupport />
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

        <div className={layout.actionBar}>
          <div className={layout.publicationControls}>
            {!isSettings && !record.readOnly ? (
              <div className={layout.visibility}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!record.published}
                  aria-label="Zverejnenie na webe"
                  className={layout.visibilitySwitch}
                  disabled={editorBusy || mustSaveBeforePublishing}
                  title={
                    mustSaveBeforePublishing
                      ? "Najprv uložte zmeny, potom obsah zverejnite."
                      : undefined
                  }
                  onClick={() => void setPublished(!record.published)}
                >
                  <span aria-hidden="true" />
                </button>
                <span>Na webe</span>
                {mustSaveBeforePublishing ? <small>Najprv uložiť</small> : null}
              </div>
            ) : null}
            <p className={layout.status} role="status" aria-live="polite">
              {status}
            </p>
          </div>
          <div className={styles.actions}>
            {!isSettings ? (
              <button
                className={styles.quietLink}
                type="button"
                disabled={editorBusy}
                aria-pressed={previewMode}
                onClick={() => setPreviewMode((current) => !current)}
              >
                {previewMode ? "Späť na úpravu" : "Náhľad"}
              </button>
            ) : null}
            {!record.readOnly ? (
              <button
                className={styles.button}
                type="submit"
                disabled={editorBusy || !needsSave}
              >
                Uložiť
              </button>
            ) : null}
          </div>
        </div>

        <div hidden={previewMode}>
          <EditorValidation field={errorField} message={error}>
            <fieldset
              className={styles.disabled}
              disabled={busy || record.readOnly}
              aria-label="Obsah záznamu"
            >
              <RecordForm
                record={record}
                onChange={setRecord}
                disabled={record.readOnly || busy}
                onBusyChange={setFormBusy}
              />
            </fieldset>
          </EditorValidation>
        </div>
        {previewMode ? (
          <div className={layout.preview}>
            <RecordLivePreview record={record} />
          </div>
        ) : null}

        {!isSettings ? (
          <footer className={layout.recordFooter}>
            <div className={layout.recordLinks}>
              {publicPath && record.published && !record.readOnly ? (
                <a href={publicPath} target="_blank" rel="noopener noreferrer">
                  {record.kind === "bulletin"
                    ? "Verejné oznamy ↗"
                    : "Verejná stránka ↗"}
                </a>
              ) : null}
            </div>
            <dl className={layout.metadata}>
              <div>
                <dt>Verzia</dt>
                <dd>{record.version}</dd>
              </div>
              <div>
                <dt>Vytvorené</dt>
                <dd>
                  <RecordTimestamp value={record.createdAt} />
                </dd>
              </div>
              <div>
                <dt>Posledná úprava</dt>
                <dd>
                  <RecordTimestamp value={record.updatedAt} />
                </dd>
              </div>
            </dl>
          </footer>
        ) : null}
      </form>
    </div>
  );
}
