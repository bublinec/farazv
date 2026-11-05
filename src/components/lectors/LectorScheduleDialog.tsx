"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import type { LectorSchedule } from "@/content/lector-schedules";
import { getNextLocalMidnight } from "@/lib/calendar";
import { lectorMonths, lectorMonthLabel } from "@/lib/lector-schedules";
import { containDialogFocus } from "@/lib/dialog";
import { Icon } from "@/components/ui/Icon";
import { AdminRequestError, readAdminJson } from "@/components/admin/admin-api";
import { fetchLectorPdf } from "./pdf-client";
import styles from "./LectorScheduleDialog.module.css";

// Browser-only interaction state shared by the two entry points in one tab.
let tabToken = "";

export function LectorScheduleDialog({
  variant = "panel",
  onOpen,
  onReturnFocus
}: {
  variant?: "panel" | "footer" | "navigation";
  onOpen?: () => void;
  onReturnFocus?: () => void;
}) {
  const id = useId();
  const [mounted, setMounted] = useState(false);
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
  const [passwordNotConfigured, setPasswordNotConfigured] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setMounted(true);
    const clear = () => {
      token.current = "";
      tabToken = "";
      active.current?.abort();
      active.current = null;
      for (const url of urls.current) URL.revokeObjectURL(url);
      urls.current.clear();
      setHasAccess(false);
      setMonths([]);
      setPassword("");
      setBusy("");
      setError("");
      setPasswordNotConfigured(false);
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
      tabToken = "";
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
    setPasswordNotConfigured(false);
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
      tabToken = "";
      setHasAccess(false);
      setMonths([]);
    }
    setPasswordNotConfigured(
      cause instanceof AdminRequestError &&
        cause.code === "LECTOR_NOT_CONFIGURED"
    );
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
  useEffect(() => {
    if (!hasAccess) return;

    let month = lectorMonths()[0];
    let timer: ReturnType<typeof setTimeout>;
    function checkMonth() {
      const current = lectorMonths()[0];
      if (current === month) return;
      month = current;
      active.current?.abort();
      active.current = null;
      setMonths([]);
      if (dialog.current?.open) void refresh();
    }
    function schedule() {
      timer = setTimeout(() => {
        checkMonth();
        schedule();
      }, getNextLocalMidnight().getTime() - Date.now() + 50);
    }
    function visible() {
      if (!document.hidden) checkMonth();
    }
    schedule();
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [hasAccess]);

  function open() {
    token.current = tabToken;
    setHasAccess(Boolean(tabToken));
    if (!tabToken) setMonths([]);
    onOpen?.();
    dialog.current?.showModal();
    setError("");
    setPasswordNotConfigured(false);
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
      tabToken = result.token;
      setPassword("");
      setShowPassword(false);
      setHasAccess(true);
      await readMonths(controller);
      if (!controller.signal.aborted) {
        focusResult.current = true;
        setNotice("Rozpis je odomknutý.");
      }
    } catch (cause) {
      failure(cause, controller);
      passwordInput.current?.focus();
    } finally {
      finish(controller);
    }
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
    setPasswordNotConfigured(false);
    if (onReturnFocus) onReturnFocus();
    else trigger.current?.focus();
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        disabled={!mounted}
        className={
          variant === "footer"
            ? styles.footerTrigger
            : variant === "navigation"
            ? styles.navigationTrigger
            : styles.trigger
        }
        onClick={open}
      >
        {variant === "panel" ? <Icon name="calendar" size={21} /> : null}
        {variant === "navigation"
          ? "Rozpis služieb lektorov"
          : "Rozpis lektorov"}
        {variant !== "panel" ? <Icon name="arrow-right" size={15} /> : null}
      </button>
      {mounted
        ? createPortal(
            <dialog
              ref={dialog}
              className={styles.dialog}
              aria-labelledby={`${id}-title`}
              aria-describedby={`${id}-description`}
              onClose={closed}
              onKeyDown={(event) => {
                event.stopPropagation();
                containDialogFocus(event);
              }}
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
                  ? "Otvorte alebo stiahnite rozpis na aktuálny mesiac."
                  : "Rozpis obsahuje kontakty na lektorov. Na jeho otvorenie zadajte spoločné heslo."}
              </p>
              {error ? (
                <p className={styles.error} role="alert">
                  {passwordNotConfigured ? (
                    <>
                      Heslo k rozpisom ešte nie je nastavené. Napíšte nám
                      pripomienku cez{" "}
                      <Link
                        href="/podnety"
                        onClick={() => dialog.current?.close()}
                      >
                        Podnety a nápady
                      </Link>
                      .
                    </>
                  ) : (
                    error
                  )}
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
                      onChange={(event) =>
                        setShowPassword(event.target.checked)
                      }
                    />
                    Zobraziť heslo
                  </label>
                  <button
                    type="submit"
                    className={styles.primary}
                    disabled={!!busy}
                  >
                    {busy || "Otvoriť rozpis"}
                  </button>
                  <p className={styles.help}>
                    Ak heslo nepoznáte, obráťte sa na osobu, ktorá pripravuje
                    rozpis.
                  </p>
                </form>
              ) : (
                <>
                  <ul className={styles.months}>
                    {months.map((month) => (
                      <li key={month.month}>
                        <h3 tabIndex={-1}>{lectorMonthLabel(month.month)}</h3>
                        <p className={styles.monthNote}>Aktuálny mesiac</p>
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
                      Po obnovení stránky alebo zatvorení karty bude potrebné
                      zadať heslo znova.
                    </p>
                  </div>
                </>
              )}
              <p className={styles.status} role="status" aria-live="polite">
                {hasAccess ? busy || notice : ""}
              </p>
            </dialog>,
            document.body
          )
        : null}
    </>
  );
}
