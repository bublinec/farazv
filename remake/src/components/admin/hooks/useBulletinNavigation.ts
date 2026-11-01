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
    result?: BulletinImportResult
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
      if (result) storeBulletinImport(weekStart, result);
      else clearBulletinImport();
      startNavigation(() => router.push(href));
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
