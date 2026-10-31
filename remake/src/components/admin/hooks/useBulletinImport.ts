import { useEffect, useRef, useState } from "react";
import type { BulletinDocument } from "@/content/documents";
import type { BulletinImportResult } from "@/content/bulletin-import";
import {
  applyBulletinImport,
  bulletinImportReplacements
} from "@/lib/bulletin-import-form";
import { useBulletinNavigation } from "./useBulletinNavigation";
import {
  clearBulletinImport,
  takeBulletinImport
} from "../bulletin-import-handoff";

/** Own review handoff and navigation; applying, saving and publishing stay separate. */
export function useBulletinImport(
  document: BulletinDocument,
  onChange: (document: BulletinDocument) => void,
  enabled = true
) {
  const navigation = useBulletinNavigation();
  const [initialResult, setInitialResult] = useState<BulletinImportResult>();
  const [message, setMessage] = useState("");
  const handoffKey = useRef("");

  useEffect(() => {
    if (!enabled) return;
    const key = `${document.id}:${document.weekStart}`;
    // Consume and fill only once, including StrictMode's effect replay.
    if (handoffKey.current === key) return;
    handoffKey.current = key;
    const handoff = takeBulletinImport(document.weekStart);
    setInitialResult(handoff?.result);
    setMessage("");
    if (handoff?.fillForm) {
      onChange(applyBulletinImport(document, handoff.result));
      setMessage(
        "Dokument je vo formulári. Skontrolujte údaje a uložte koncept alebo ho zverejnite."
      );
    }
  }, [document, onChange, enabled]);

  function apply(result: BulletinImportResult) {
    const next = applyBulletinImport(document, result);
    const replacements = bulletinImportReplacements(document, next);
    if (
      replacements.length &&
      !window.confirm(
        `Načítanie nahradí existujúce údaje vo formulári:\n\n${replacements.join(
          "\n"
        )}\n\nOstatné dni zostanú zachované. Pokračovať?`
      )
    )
      return;

    onChange(next);
    setMessage(
      "Údaje sú vo formulári. Skontrolujte ich a uložte koncept alebo ho zverejnite."
    );
    clearBulletinImport();
    requestAnimationFrame(() => {
      const fields = window.document.getElementById("bulletin-week");
      fields?.focus();
      fields?.scrollIntoView({ block: "start" });
    });
  }

  return {
    initialResult,
    message,
    apply,
    ...navigation
  };
}
