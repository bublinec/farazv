"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./Feedback.module.css";

const dismissalKey = "farazv:feedback-welcome:2026-11-14";

export function WelcomeFeedbackBanner() {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(dismissalKey) === "1");
    } catch {
      /* The banner can still be dismissed for this visit. */
    }
  }, []);
  if (dismissed) return null;

  return (
    <aside className={styles.welcome} aria-label="Vitajte na novom webe">
      <div className={`container ${styles.welcomeInner}`}>
        <p>
          <strong>Vitajte na našom novom webe.</strong> Čo môžeme zlepšiť?
        </p>
        <Link href="/podnety?tema=web">Napíšte nám svoj podnet</Link>
        <button
          type="button"
          className={styles.close}
          aria-label="Zavrieť privítanie"
          onClick={() => {
            setDismissed(true);
            try {
              localStorage.setItem(dismissalKey, "1");
            } catch {
              /* Keep the in-memory dismissal. */
            }
          }}
        >
          <Icon name="close" size={19} />
        </button>
      </div>
    </aside>
  );
}
