"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./page.module.css";

export function GoogleSignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
        errorCallbackURL: "/admin/login?error=access"
      });
      if (result.error) throw new Error("Sign-in failed");
    } catch {
      setError("Prihlásenie sa nepodarilo spustiť. Skúste to znova.");
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className={styles.google}
        onClick={signIn}
        disabled={busy}
      >
        {busy ? "Prihlasujem…" : "Prihlásiť sa cez Google"}
      </button>
      {error && (
        <p className={styles.notice} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
