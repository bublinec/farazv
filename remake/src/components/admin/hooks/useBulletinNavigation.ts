import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BulletinImportResult } from "@/content/bulletin-import";
import type { CalendarDate } from "@/content/types";
import { readAdminJson } from "../admin-api";
import { findEditableBulletin } from "../bulletin-records";
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

  useEffect(() => {
    function cancelOpening() {
      request.current?.abort();
      request.current = null;
      setOpening(false);
    }

    function followLink(event: MouseEvent) {
      if (
        event.defaultPrevented ||
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

    document.addEventListener("click", followLink);
    window.addEventListener("popstate", cancelOpening);
    window.addEventListener("admin:before-leave", leave);
    return () => {
      request.current?.abort();
      request.current = null;
      document.removeEventListener("click", followLink);
      window.removeEventListener("popstate", cancelOpening);
      window.removeEventListener("admin:before-leave", leave);
    };
  }, []);

  async function openWeek(
    weekStart: CalendarDate,
    result?: BulletinImportResult,
    fillForm = false
  ) {
    if (request.current || navigating) return;
    if (
      !window.dispatchEvent(
        new Event("admin:before-leave", { cancelable: true })
      )
    )
      return;

    const controller = new AbortController();
    request.current = controller;
    setOpening(true);

    try {
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
      if (controller.signal.aborted) return;

      if (result) storeBulletinImport(weekStart, result, fillForm);
      else clearBulletinImport();
      startNavigation(() =>
        router.push(`/admin/records/${encodeURIComponent(target.id)}`)
      );
    } catch (error) {
      if (!controller.signal.aborted) throw error;
    } finally {
      if (request.current === controller) {
        request.current = null;
        setOpening(false);
      }
    }
  }

  return { openWeek, opening: opening || navigating };
}
