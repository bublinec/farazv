"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readAdminJson } from "./admin-api";
import styles from "./Admin.module.css";

/** Only a fresh installation needs this; opening existing settings is read-only. */
export function SettingsSetup() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    setBusy(true);
    setError("");
    try {
      await readAdminJson(
        await fetch("/api/admin/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "settings" })
        })
      );
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Nastavenia sa nepodarilo otvoriť."
      );
      setBusy(false);
    }
  }

  return (
    <section className={styles.panel}>
      <h1>Nastavenia farnosti</h1>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
          <TechnicalSupport />
        </p>
      ) : null}
      <button
        type="button"
        className={styles.button}
        disabled={busy}
        onClick={() => void create()}
      >
        {busy ? "Pripravujem…" : "Vytvoriť nastavenia"}
      </button>
    </section>
  );
}
