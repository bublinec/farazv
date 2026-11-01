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

function confirmReplacement(current: BulletinDocument, next: BulletinDocument) {
  const replacements = bulletinImportReplacements(current, next);
  return (
    !replacements.length ||
    window.confirm(
      `Nahradiť existujúce údaje načítaným dokumentom?\n\n${replacements.join(
        "\n"
      )}\n\nOstatné dni zostanú zachované.`
    )
  );
}

/** Imported values stay local until the editor explicitly saves or publishes. */
export function useBulletinImport(
  document: BulletinDocument,
  onChange: (document: BulletinDocument) => void,
  enabled = true
) {
  const navigation = useBulletinNavigation();
  const [result, setResult] = useState<BulletinImportResult>();
  const [pending, setPending] = useState(false);
  const handoffKey = useRef("");

  function apply(imported: BulletinImportResult, allowDifferentWeek = false) {
    setResult(imported);
    if (
      !allowDifferentWeek &&
      imported.suggestedWeekStart &&
      imported.suggestedWeekStart !== document.weekStart
    ) {
      setPending(true);
      return;
    }

    const next = applyBulletinImport(document, imported);
    if (!confirmReplacement(document, next)) {
      setPending(true);
      return;
    }

    onChange(next);
    setPending(false);
    clearBulletinImport();
  }

  const applyLatest = useRef(apply);
  applyLatest.current = apply;

  useEffect(() => {
    if (!enabled) return;
    const key = `${document.id}:${document.weekStart}`;
    // Consume once, including StrictMode's effect replay. Both upload paths use
    // the same replacement confirmation before changing existing local fields.
    if (handoffKey.current === key) return;
    handoffKey.current = key;
    const handoff = takeBulletinImport(document.weekStart);
    setResult(handoff?.result);
    setPending(false);
    if (handoff) applyLatest.current(handoff.result);
  }, [document.id, document.weekStart, enabled]);

  return {
    result,
    pending,
    apply,
    applyCurrentWeek: () => result && apply(result, true),
    ...navigation
  };
}
