import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BulletinDocument } from "@/content/documents";
import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import {
  applyBulletinImport,
  bulletinImportReplacements
} from "@/lib/bulletin-import-form";
import { readAdminJson } from "../admin-api";
import { findEditableBulletin } from "../bulletin-records";
import {
  clearBulletinImport,
  storeBulletinImport,
  takeBulletinImport
} from "../bulletin-import-handoff";

/** Own review handoff and navigation; applying, saving and publishing stay separate. */
export function useBulletinImport(
  document: BulletinDocument,
  onChange: (document: BulletinDocument) => void
) {
  const router = useRouter();
  const [initialResult, setInitialResult] = useState<BulletinImportResult>();
  const [message, setMessage] = useState("");
  const [opening, setOpening] = useState(false);
  const [navigating, startNavigation] = useTransition();
  const navigationRequest = useRef<AbortController | null>(null);
  const handoff = useRef<{ key: string; result?: BulletinImportResult } | null>(
    null
  );

  useEffect(() => {
    const key = `${document.id}:${document.weekStart}`;
    // Keep a consumed handoff through StrictMode's effect replay.
    if (handoff.current?.key !== key)
      handoff.current = { key, result: takeBulletinImport(document.weekStart) };
    setInitialResult(handoff.current.result);
    setMessage("");
    setOpening(false);

    function cancelOpening() {
      navigationRequest.current?.abort();
      navigationRequest.current = null;
      setOpening(false);
    }

    function followLink(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search
      )
        cancelOpening();
    }

    function leave(event: Event) {
      if (!event.defaultPrevented) cancelOpening();
    }

    // A late lookup must not override an accepted link, browser traversal or sign-out.
    window.document.addEventListener("click", followLink);
    window.addEventListener("popstate", cancelOpening);
    window.addEventListener("admin:before-leave", leave);
    return () => {
      navigationRequest.current?.abort();
      navigationRequest.current = null;
      window.document.removeEventListener("click", followLink);
      window.removeEventListener("popstate", cancelOpening);
      window.removeEventListener("admin:before-leave", leave);
    };
  }, [document.id, document.weekStart]);

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
      "Údaje sú vo formulári. Skontrolujte ich a použite Uložiť koncept. Verejná verzia sa nezmenila."
    );
    clearBulletinImport();
    requestAnimationFrame(() => {
      const fields = window.document.getElementById("bulletin-week");
      fields?.focus();
      fields?.scrollIntoView({ block: "start" });
    });
  }

  async function openWeek(
    weekStart: CalendarDate,
    result: BulletinImportResult
  ) {
    if (navigationRequest.current) return;
    if (
      !window.dispatchEvent(
        new Event("admin:before-leave", { cancelable: true })
      )
    )
      return;

    const controller = new AbortController();
    navigationRequest.current = controller;
    setOpening(true);

    try {
      storeBulletinImport(weekStart, result);
      const existing = await findEditableBulletin(weekStart, controller.signal);
      if (controller.signal.aborted) return;

      const target =
        existing ??
        (await readAdminJson(
          await fetch("/api/admin/records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kind: "bulletin", weekStart }),
            signal: controller.signal
          })
        ));

      if (!controller.signal.aborted)
        startNavigation(() =>
          router.push(`/admin/records/${encodeURIComponent(target.id)}`)
        );
    } catch (error) {
      if (!controller.signal.aborted) throw error;
    } finally {
      if (navigationRequest.current === controller) {
        navigationRequest.current = null;
        setOpening(false);
      }
    }
  }

  return {
    initialResult,
    message,
    apply,
    openWeek,
    opening: opening || navigating
  };
}
