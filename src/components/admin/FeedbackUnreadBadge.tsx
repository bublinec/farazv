"use client";

import { useEffect, useState } from "react";
import { readAdminJson } from "./admin-api";
import styles from "./FeedbackInbox.module.css";

export function FeedbackUnreadBadge() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let request: AbortController | null = null;
    async function refresh() {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      try {
        const data = await readAdminJson(
          await fetch("/api/admin/feedback?summary=1", {
            cache: "no-store",
            signal: controller.signal
          })
        );
        if (!controller.signal.aborted)
          setCount(
            typeof data.unreadCount === "number" ? data.unreadCount : null
          );
      } catch {
        if (!controller.signal.aborted) setCount(null);
      }
    }
    function update() {
      void refresh();
    }
    update();
    window.addEventListener("focus", update);
    window.addEventListener("feedback:changed", update);
    return () => {
      request?.abort();
      window.removeEventListener("focus", update);
      window.removeEventListener("feedback:changed", update);
    };
  }, []);
  return count ? (
    <span className={styles.unreadCount} aria-label={`Nové podnety: ${count}`}>
      {count > 99 ? "99+" : count}
    </span>
  ) : null;
}
