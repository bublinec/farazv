"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNextParishRefresh } from "@/lib/calendar";

/** Date-derived labels and visibility must change even without a content publish. */
export function DateRefresh() {
  const router = useRouter();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      timer = setTimeout(() => {
        router.refresh();
        schedule();
      }, getNextParishRefresh().getTime() - Date.now() + 150);
    }
    function visible() {
      if (!document.hidden) {
        clearTimeout(timer);
        router.refresh();
        schedule();
      }
    }
    schedule();
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [router]);
  return null;
}
