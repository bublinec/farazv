"use client";

import { useEffect, useRef, useState } from "react";
import type { LectorPasswordStatus } from "@/content/lector-schedules";
import { AdminRequestError, readAdminJson } from "./admin-api";
import styles from "./Admin.module.css";
import lectorStyles from "./LectorSchedules.module.css";

export function LectorPassword() {
  const [status, setStatus] = useState<LectorPasswordStatus | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const active = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    active.current = controller;
    fetch("/api/admin/lectors/password", {
      cache: "no-store",
      signal: controller.signal
    })
      .then(readAdminJson)
      .then((value) => {
        if (!controller.signal.aborted) setStatus(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Nastavenie hesla je nedostupné."
          );
      })
      .finally(() => {
        if (active.current === controller) active.current = null;
      });
    return () => active.current?.abort();
  }, []);

  async function save() {
    if (active.current || !status) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/lectors/password", {
        method: "PUT",
        cache: "no-store",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, revision: status.revision })
      });
      const next = await readAdminJson(response);
      if (controller.signal.aborted) return;
      setStatus(next);
      setPassword("");
      setShow(false);
      setMessage(
        "Heslo bolo uložené. Všetky doterajšie prístupy k rozpisom boli zamknuté."
      );
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(
        cause instanceof Error ? cause.message : "Heslo sa nepodarilo uložiť."
      );
      if (cause instanceof AdminRequestError && cause.status === 409) {
        try {
          setStatus(
            await readAdminJson(
              await fetch("/api/admin/lectors/password", {
                cache: "no-store",
                signal: controller.signal
              })
            )
          );
        } catch {
          /* Original conflict explains recovery. */
        }
      }
    } finally {
      if (active.current === controller) {
        active.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <section
      className={`${styles.panel} ${lectorStyles.password}`}
      aria-labelledby="lector-password-title"
    >
      <h2 id="lector-password-title">Heslo k rozpisom lektorov</h2>
      <p>
        Spoločné heslo pre čitateľov rozpisu. Prihlásenie do CMS naďalej funguje
        cez Google.
      </p>
      {status ? (
        <p className={styles.hint}>
          {status.configured
            ? "Heslo je nastavené. Existujúce heslo sa nezobrazuje."
            : "Heslo zatiaľ nie je nastavené. Rozpisy sa čitateľom neotvoria."}
        </p>
      ) : !error ? (
        <p role="status">Načítavam nastavenie hesla…</p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className={styles.status} role="status">
          {message}
        </p>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className={styles.field}>
          Nové heslo k rozpisom
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            autoCapitalize="none"
            spellCheck={false}
            required
            minLength={8}
            maxLength={128}
            disabled={busy || !status}
            aria-describedby="lector-password-help"
          />
        </label>
        <p id="lector-password-help" className={styles.hint}>
          Aspoň 8 znakov. Zadaním nového hesla zrušíte všetky doterajšie
          odomknutia.
        </p>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={show}
            onChange={(event) => setShow(event.target.checked)}
          />
          Zobraziť heslo
        </label>
        <button
          className={styles.button}
          type="submit"
          disabled={busy || !status}
        >
          {busy ? "Ukladám heslo…" : "Uložiť heslo k rozpisom"}
        </button>
      </form>
    </section>
  );
}
