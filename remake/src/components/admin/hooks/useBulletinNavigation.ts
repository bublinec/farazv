import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCancelOnNavigation } from "./useCancelOnNavigation";
import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import { readAdminJson } from "../admin-api";
import {
  clearBulletinImport,
  storeBulletinImport
} from "../bulletin-import-handoff";

/** Open an exact week without replacing a draft or publishing during navigation. */
export function useBulletinNavigation() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [navigating, startNavigation] = useTransition();
  const request = useRef<AbortController | null>(null);

  useCancelOnNavigation(() => {
    request.current?.abort();
    request.current = null;
    setOpening(false);
  });

  useEffect(() => () => request.current?.abort(), []);

  async function openWeek(
    weekStart: CalendarDate,
    result?: BulletinImportResult,
    options?: { newTab?: boolean }
  ) {
    if (request.current || navigating) return;
    if (
      !options?.newTab &&
      !window.dispatchEvent(
        new Event("admin:before-leave", { cancelable: true })
      )
    )
      return;

    // Open synchronously from the click so the browser permits the new tab.
    // Its own temporary storage receives the import; the current draft stays here.
    const tab = options?.newTab ? window.open("about:blank", "_blank") : null;
    if (options?.newTab && !tab)
      throw new Error(
        "Povoľte otvorenie novej karty a skúste znova. Aktuálne oznamy zostali zachované."
      );
    if (tab) {
      tab.opener = null;
      tab.document.title = "Farské oznamy · Admin";
      tab.document.body.textContent = "Otváram oznamy…";
    }

    const controller = new AbortController();
    request.current = controller;
    setOpening(true);

    try {
      const target = await readAdminJson(
        await fetch("/api/admin/bulletins/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekStart }),
          signal: controller.signal
        })
      );
      if (controller.signal.aborted) return;

      const href = `/admin/records/${encodeURIComponent(target.id)}`;
      if (tab) {
        if (tab.closed) return;
        if (result) storeBulletinImport(weekStart, result, tab.sessionStorage);
        tab.location.replace(href);
      } else {
        if (result) storeBulletinImport(weekStart, result);
        else clearBulletinImport();
        startNavigation(() => router.push(href));
      }
    } catch (error) {
      tab?.close();
      if (!controller.signal.aborted) throw error;
    } finally {
      if (controller.signal.aborted) tab?.close();
      if (request.current === controller) {
        request.current = null;
        setOpening(false);
      }
    }
  }

  return { openWeek, opening: opening || navigating };
}
