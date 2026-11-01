"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  BULLETIN_IMPORT_MAX_BYTES,
  BULLETIN_IMPORT_MAX_TEXT,
  type BulletinImportResult
} from "@/content/bulletin-import";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import type { CalendarDate } from "@/content/types";
import { readAdminJson } from "./admin-api";
import { isBulletinImportResult } from "@/lib/bulletin-import-result";
import { getMonday } from "@/lib/calendar";
import { useCancelOnNavigation } from "./hooks/useCancelOnNavigation";
import type { BulletinImportTargetWeek } from "./BulletinImportPreview";
import admin from "./Admin.module.css";
import styles from "./BulletinImport.module.css";

type BulletinImportProps = {
  weekStart: CalendarDate;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
} & (
  | { mode: "start"; onTargetWeek: BulletinImportTargetWeek; onApply?: never }
  | {
      mode?: "editor";
      onApply: (result: BulletinImportResult) => void;
      onTargetWeek?: BulletinImportTargetWeek;
    }
);

export function BulletinImport({
  weekStart,
  onApply,
  onTargetWeek,
  mode = "editor",
  disabled = false,
  onBusyChange
}: BulletinImportProps) {
  const titleId = useId();
  const hintId = useId();
  const fileId = useId();
  const request = useRef<AbortController | null>(null);
  const applyLatest = useRef(onApply);
  applyLatest.current = onApply;
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [reviewWeek, setReviewWeek] = useState(weekStart);
  const [result, setResult] = useState<BulletinImportResult | null>(null);
  const [error, setError] = useState("");
  const [technicalFailure, setTechnicalFailure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pastedText, setPastedText] = useState("");

  useEffect(() => {
    setResult(null);
    setError("");
    setTechnicalFailure(false);
    setBusy(false);
    setReviewWeek(weekStart);
    setDragging(false);
    dragDepth.current = 0;

    return () => request.current?.abort();
  }, [weekStart]);

  useCancelOnNavigation(() => {
    request.current?.abort();
    request.current = null;
    setBusy(false);
  });

  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  function clearAnalysis() {
    request.current?.abort();
    request.current = null;
    setResult(null);
    setError("");
    setTechnicalFailure(false);
    setBusy(false);
  }

  async function parse(file: File) {
    clearAnalysis();
    if (disabled) return;
    if (!/\.(docx?|txt)$/i.test(file.name)) {
      setError("Vyberte dokument .doc, .docx alebo textový súbor .txt.");
      return;
    }
    if (!file.size || file.size > BULLETIN_IMPORT_MAX_BYTES) {
      setError("Súbor musí obsahovať text a mať najviac 3 MB.");
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setBusy(true);

    try {
      const query = new URLSearchParams({ filename: file.name, weekStart });
      const response = await fetch(`/api/admin/bulletins/import?${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: file,
        signal: controller.signal,
        cache: "no-store"
      });
      const parsed: unknown = await readAdminJson(response);
      if (!isBulletinImportResult(parsed))
        throw new Error(
          "Služba vrátila neúplný výsledok. Vyberte dokument znova alebo vložte jeho text."
        );
      if (request.current === controller && !controller.signal.aborted) {
        if (mode === "editor") {
          applyLatest.current?.(parsed);
        } else if (parsed.suggestedWeekStart) {
          setResult(parsed);
          setReviewWeek(parsed.suggestedWeekStart);
          // Parsing is complete. Navigation owns its separate loading state,
          // so a parsing Cancel button must not promise to cancel that request.
          setBusy(false);
          request.current = null;
          await openTargetWeek(parsed.suggestedWeekStart, parsed);
        } else {
          setResult(parsed);
          setReviewWeek(weekStart);
        }
      }
    } catch (cause) {
      if (request.current === controller && !controller.signal.aborted) {
        setTechnicalFailure(true);
        setError(
          cause instanceof Error
            ? cause.message
            : "Dokument sa nepodarilo načítať. Skúste vložiť jeho text."
        );
      }
    } finally {
      if (request.current === controller && !controller.signal.aborted) {
        setBusy(false);
        request.current = null;
      }
    }
  }

  async function openTargetWeek(
    target: CalendarDate,
    imported: BulletinImportResult
  ) {
    if (!onTargetWeek || disabled) return;

    setError("");
    setTechnicalFailure(false);
    try {
      await onTargetWeek(target, imported);
    } catch (cause) {
      setTechnicalFailure(true);
      setError(
        cause instanceof Error
          ? cause.message
          : "Týždeň sa nepodarilo otvoriť. Načítaný dokument zostáva na kontrolu."
      );
    }
  }

  return (
    <section className={admin.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className="srOnly">
        Nahrať týždenné oznamy
      </h2>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
        aria-busy={busy}
        onDragEnter={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          dragDepth.current++;
          if (!disabled && !busy) setDragging(true);
        }}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            event.dataTransfer.dropEffect = disabled || busy ? "none" : "copy";
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (disabled || busy) return;
          if (event.dataTransfer.files.length !== 1) {
            setTechnicalFailure(false);
            setError("Vyberte jeden dokument oznamov.");
            return;
          }
          void parse(event.dataTransfer.files[0]);
        }}
      >
        <input
          id={fileId}
          className={styles.fileInput}
          type="file"
          accept=".doc,.docx,.txt"
          disabled={disabled || busy}
          aria-describedby={hintId}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void parse(file);
            else clearAnalysis();
            event.currentTarget.value = "";
          }}
        />
        <label htmlFor={fileId} className={styles.dropLabel}>
          <svg
            aria-hidden="true"
            viewBox="0 0 32 32"
            width="40"
            height="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 22V5m-6 6 6-6 6 6M5 21v6h22v-6" />
          </svg>
          <strong>Sem presuňte súbor s oznamami</strong>
          <span id={hintId}>Word alebo text · .doc, .docx, .txt · do 3 MB</span>
          <span className={admin.button}>
            {busy ? "Načítavam…" : "Vybrať súbor"}
          </span>
        </label>
      </div>

      <details className={styles.paste}>
        <summary>Vložiť text namiesto súboru</summary>
        <label className={admin.field}>
          Text oznamov vrátane dátumov a rozpisu
          <textarea
            value={pastedText}
            maxLength={BULLETIN_IMPORT_MAX_TEXT}
            rows={8}
            disabled={disabled}
            onChange={(event) => {
              clearAnalysis();
              setPastedText(event.target.value);
            }}
          />
        </label>
        <button
          type="button"
          className={admin.secondary}
          disabled={disabled || busy || !pastedText.trim()}
          onClick={() =>
            void parse(
              new File([pastedText], "oznamy.txt", { type: "text/plain" })
            )
          }
        >
          Rozpoznať vložený text
        </button>
      </details>

      {busy ? (
        <p className={admin.status} role="status">
          Čítam dokument a rozpoznávam údaje…
        </p>
      ) : null}
      {busy ? (
        <button
          type="button"
          className={admin.secondary}
          onClick={clearAnalysis}
        >
          Zrušiť načítanie
        </button>
      ) : null}
      {error ? (
        <p className={admin.error} role="alert">
          {error}
          {technicalFailure ? <TechnicalSupport /> : null}
        </p>
      ) : null}
      {mode === "start" && result && !busy ? (
        <div className={styles.weekChoice}>
          <label className={admin.field}>
            {result.suggestedWeekStart
              ? "Týždeň od pondelka"
              : "Pre ktorý týždeň sú oznamy?"}
            <input
              type="date"
              value={reviewWeek}
              disabled={disabled || busy}
              onChange={(event) => {
                if (!event.target.value) return;
                try {
                  setReviewWeek(getMonday(event.target.value as CalendarDate));
                  setError("");
                } catch {
                  setTechnicalFailure(false);
                  setError("Vyberte platný dátum týždňa.");
                }
              }}
            />
          </label>
          <button
            type="button"
            className={admin.button}
            disabled={disabled || busy}
            onClick={() => void openTargetWeek(reviewWeek, result)}
          >
            Otvoriť a upraviť oznamy
          </button>
        </div>
      ) : null}
    </section>
  );
}
