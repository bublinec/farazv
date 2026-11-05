"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LectorSchedule } from "@/content/lector-schedules";
import { lectorMonthLabel } from "@/lib/lector-schedules";
import { containDialogFocus } from "@/lib/dialog";
import { Icon } from "@/components/ui/Icon";
import { AdminRequestError, readAdminJson } from "@/components/admin/admin-api";
import { fetchLectorPdf } from "./pdf-client";
import styles from "./LectorScheduleDialog.module.css";

export function LectorScheduleDialog() {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const token = useRef("");
  const focusResult = useRef(false);
  const active = useRef<AbortController | null>(null);
  const urls = useRef(new Set<string>());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [months, setMonths] = useState<LectorSchedule[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const clear = () => {
      token.current = "";
      active.current?.abort();
      active.current = null;
      for (const url of urls.current) URL.revokeObjectURL(url);
      urls.current.clear();
      setHasAccess(false);
      setMonths([]);
      setPassword("");
      setBusy("");
      setError("");
      dialog.current?.close();
    };
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) clear();
    };
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", restored);
    return () => {
      window.removeEventListener("pagehide", clear);
      window.removeEventListener("pageshow", restored);
      active.current?.abort();
      token.current = "";
      for (const url of urls.current) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    if (!focusResult.current || !hasAccess || busy) return;
    focusResult.current = false;
    if (dialog.current?.open) {
      const target =
        dialog.current.querySelector<HTMLElement>("[data-lector-pdf]") ??
        dialog.current.querySelector<HTMLElement>("h3, h2");
      target?.focus();
    }
  }, [hasAccess, months, busy]);
  function begin(label: string) {
    if (active.current) return null;
    const controller = new AbortController();
    active.current = controller;
    setBusy(label);
    setError("");
    return controller;
  }
  function finish(controller: AbortController) {
    if (active.current === controller) {
      active.current = null;
      setBusy("");
    }
  }
  function failure(cause: unknown, controller: AbortController) {
    if (controller.signal.aborted) return;
    if (cause instanceof AdminRequestError && cause.status === 401) {
      token.current = "";
      setHasAccess(false);
      setMonths([]);
    }
    setError(
      cause instanceof Error
        ? cause.message
        : "Rozpis sa nepodarilo otvoriť. Skúste to znova."
    );
  }
  async function readMonths(controller: AbortController) {
    const data = await readAdminJson(
      await fetch("/api/lectors", {
        cache: "no-store",
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token.current}` }
      })
    );
    if (!controller.signal.aborted) setMonths(data.months);
  }
  async function refresh() {
    const controller = begin("Načítavam rozpisy…");
    if (!controller) return;
    try {
      await readMonths(controller);
    } catch (cause) {
      failure(cause, controller);
    } finally {
      finish(controller);
    }
  }
  function open() {
    dialog.current?.showModal();
    setError("");
    if (token.current) void refresh();
    else passwordInput.current?.focus();
  }
  async function unlock() {
    const controller = begin("Overujem heslo…");
    if (!controller) return;
    try {
      const result = await readAdminJson(
        await fetch("/api/lectors/unlock", {
          method: "POST",
          cache: "no-store",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        })
      );
      if (controller.signal.aborted) return;
      token.current = result.token;
      setPassword("");
      setShowPassword(false);
      setHasAccess(true);
      await readMonths(controller);
      if (!controller.signal.aborted) {
        focusResult.current = true;
        setNotice("Rozpisy sú odomknuté. Vyberte mesiac.");
      }
    } catch (cause) {
      failure(cause, controller);
      passwordInput.current?.focus();
    } finally {
      finish(controller);
    }
  }
  function lock() {
    const previous = token.current;
    setNotice("");
    token.current = "";
    setHasAccess(false);
    setMonths([]);
    setError("");
    for (const url of urls.current) URL.revokeObjectURL(url);
    urls.current.clear();
    if (previous)
      void fetch("/api/lectors/session", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${previous}` },
        cache: "no-store"
      }).catch(() => {});
    window.setTimeout(() => passwordInput.current?.focus(), 0);
  }
  async function pdf(month: string, download: boolean) {
    const controller = begin("Pripravujem PDF…");
    if (!controller) return;
    try {
      urls.current.add(
        await fetchLectorPdf(`/api/lectors/${month}`, {
          signal: controller.signal,
          download,
          headers: { Authorization: `Bearer ${token.current}` }
        })
      );
    } catch (cause) {
      failure(cause, controller);
    } finally {
      finish(controller);
    }
  }
  function closed() {
    focusResult.current = false;
    active.current?.abort();
    active.current = null;
    setBusy("");
    setPassword("");
    setShowPassword(false);
    setError("");
    trigger.current?.focus();
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        onClick={open}
      >
        <Icon name="calendar" size={21} />
        Rozpis lektorov
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClose={closed}
        onKeyDown={containDialogFocus}
      >
        <header className={styles.header}>
          <h2 id={`${id}-title`} tabIndex={-1}>
            Rozpis lektorov
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Zatvoriť"
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" size={24} />
          </button>
        </header>
        <p id={`${id}-description`} className={styles.description}>
          {hasAccess
            ? "Vyberte mesiac a otvorte alebo stiahnite PDF rozpis."
            : "Rozpis obsahuje kontakty na lektorov. Na jeho otvorenie zadajte spoločné heslo."}
        </p>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        {!hasAccess ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void unlock();
            }}
          >
            <label className={styles.field}>
              Heslo
              <input
                ref={passwordInput}
                autoFocus
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={!!busy}
              />
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              Zobraziť heslo
            </label>
            <button type="submit" className={styles.primary} disabled={!!busy}>
              {busy || "Otvoriť rozpis"}
            </button>
            <p className={styles.help}>
              Ak heslo nepoznáte, obráťte sa na osobu, ktorá pripravuje rozpis.
            </p>
          </form>
        ) : (
          <>
            <ul className={styles.months}>
              {months.map((month, index) => (
                <li key={month.month}>
                  <h3 tabIndex={-1}>{lectorMonthLabel(month.month)}</h3>
                  <p className={styles.monthNote}>
                    {index === 0 ? "Aktuálny mesiac" : "Nasledujúci mesiac"}
                  </p>
                  {month.available ? (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.primary}
                        disabled={!!busy}
                        data-lector-pdf
                        onClick={() => void pdf(month.month, false)}
                      >
                        Otvoriť PDF <Icon name="external" size={18} />
                      </button>
                      <button
                        type="button"
                        className={styles.secondary}
                        disabled={!!busy}
                        onClick={() => void pdf(month.month, true)}
                      >
                        Stiahnuť PDF
                      </button>
                    </div>
                  ) : (
                    <p>Rozpis zatiaľ nie je nahraný.</p>
                  )}
                </li>
              ))}
            </ul>
            {!months.length ? (
              <button
                type="button"
                className={styles.secondary}
                disabled={!!busy}
                onClick={() => void refresh()}
              >
                Skúsiť načítať rozpisy znova
              </button>
            ) : null}
            <div className={styles.session}>
              <p>
                Po obnovení stránky alebo zatvorení karty bude potrebné zadať
                heslo znova.
              </p>
              <button
                type="button"
                className={styles.secondary}
                disabled={!!busy}
                onClick={lock}
              >
                <Icon name="lock" size={18} />
                Zamknúť rozpisy
              </button>
            </div>
          </>
        )}
        <p className={styles.status} role="status" aria-live="polite">
          {hasAccess ? busy || notice : ""}
        </p>
      </dialog>
    </>
  );
}
