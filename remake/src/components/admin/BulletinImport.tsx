"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  BULLETIN_IMPORT_MAX_BYTES,
  BULLETIN_IMPORT_MAX_TEXT,
  type BulletinImportResult
} from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import { readAdminJson } from "./admin-api";
import { isBulletinImportResult } from "@/lib/bulletin-import-result";
import {
  BulletinImportPreview,
  type BulletinImportTargetWeek
} from "./BulletinImportPreview";
import admin from "./Admin.module.css";
import styles from "./BulletinImport.module.css";

interface BulletinImportProps {
  weekStart: CalendarDate;
  onApply: (result: BulletinImportResult) => void;
  onTargetWeek?: BulletinImportTargetWeek;
  initialResult?: BulletinImportResult;
  disabled?: boolean;
}

export function BulletinImport({
  weekStart,
  onApply,
  onTargetWeek,
  initialResult,
  disabled = false
}: BulletinImportProps) {
  const titleId = useId();
  const hintId = useId();
  const request = useRef<AbortController | null>(null);
  const [result, setResult] = useState<BulletinImportResult | null>(
    initialResult ?? null
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pastedText, setPastedText] = useState("");

  useEffect(() => {
    setResult(initialResult ?? null);
    setError("");
    setBusy(false);

    return () => request.current?.abort();
  }, [weekStart, initialResult]);

  function clearAnalysis() {
    request.current?.abort();
    request.current = null;
    setResult(null);
    setError("");
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
        setResult(parsed);
      }
    } catch (cause) {
      if (request.current === controller && !controller.signal.aborted) {
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
    try {
      await onTargetWeek(target, imported);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Týždeň sa nepodarilo otvoriť. Načítaný dokument zostáva na kontrolu."
      );
    }
  }

  return (
    <section className={admin.panel} aria-labelledby={titleId}>
      <h2 id={titleId}>Načítať oznamy z dokumentu</h2>
      <p id={hintId} className={admin.hint}>
        Vyberte Word dokument a skontrolujte rozpoznaný rozpis, oznamy a dary.
        Načítanie samo nič nemení ani neukladá. Nejasné časti zostanú dostupné
        na kontrolu.
      </p>
      <label className={admin.field}>
        Dokument týždenných oznamov
        <input
          type="file"
          accept=".doc,.docx,.txt"
          disabled={disabled}
          aria-describedby={hintId}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void parse(file);
            else clearAnalysis();
            event.currentTarget.value = "";
          }}
        />
        <small>Podporované sú .doc, .docx a .txt, najviac 3 MB.</small>
      </label>

      <details className={styles.paste}>
        <summary>Dokument sa nedá prečítať? Vložte skopírovaný text</summary>
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
          <small>
            Skopírujte celý dokument aj s hlavičkami. Časy a údaje z tabuliek
            oddeľte tabulátorom alebo ponechajte každý riadok samostatne.
          </small>
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

      <p className={admin.status} role="status" aria-live="polite">
        {busy
          ? "Čítam dokument a rozpoznávam údaje…"
          : result
          ? "Dokument je pripravený na kontrolu."
          : ""}
      </p>
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
        </p>
      ) : null}
      {result ? (
        <BulletinImportPreview
          result={result}
          weekStart={weekStart}
          disabled={disabled || busy}
          onApply={onApply}
          onTargetWeek={onTargetWeek ? openTargetWeek : undefined}
        />
      ) : null}
    </section>
  );
}
