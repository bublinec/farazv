"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

import { useEffect, useRef, useState } from "react";
import {
  EDITOR_ROLES,
  EDITOR_ROLE_LABELS,
  type EditorAccessList,
  type EditorGrantRole
} from "@/content/editor-access";
import { readAdminJson } from "./admin-api";
import { Icon } from "@/components/ui/Icon";
import styles from "./Admin.module.css";
import accessStyles from "./EditorAccess.module.css";

export function EditorAccess({
  initialAccess
}: {
  initialAccess: EditorAccessList;
}) {
  const [access, setAccess] = useState(initialAccess);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EditorGrantRole>("editor");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function update(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    value = "",
    selectedRole: EditorGrantRole = role,
    previousRole?: EditorGrantRole
  ) {
    if (request.current) return;
    const address = value.trim().toLowerCase();
    if (
      method === "DELETE" &&
      !window.confirm(
        `Odobrať účtu ${address} prístup? Platí to aj pre jeho aktuálne prihlásenie.`
      )
    )
      return;

    const controller = new AbortController();
    request.current = controller;
    setBusy(
      method === "GET" ? "refresh" : method === "POST" ? "grant" : address
    );
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/editors", {
        method,
        cache: "no-store",
        signal: controller.signal,
        ...(method === "GET"
          ? {}
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: address,
                ...(method === "POST" || method === "PATCH"
                  ? { role: selectedRole }
                  : {}),
                ...(previousRole ? { previousRole } : {})
              })
            })
      });
      const next: EditorAccessList = await readAdminJson(response);
      if (controller.signal.aborted) return;
      setAccess(next);
      if (method === "POST") {
        setEmail("");
        setMessage(`Prístup pridaný: ${address}.`);
      } else if (method === "PATCH") {
        setMessage(
          `Rola účtu ${address} zmenená na ${EDITOR_ROLE_LABELS[selectedRole]}.`
        );
      } else if (method === "DELETE") {
        setMessage(`Prístup odobratý: ${address}.`);
      } else setMessage("Zoznam prístupov je aktuálny.");
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Prístupy sa nepodarilo upraviť. Skúste to znova."
        );
    } finally {
      if (request.current === controller && !controller.signal.aborted) {
        request.current = null;
        setBusy("");
      }
    }
  }

  return (
    <div className={accessStyles.page}>
      <div className={styles.heading}>
        <div>
          <h1>Prístupy</h1>
        </div>
        <button
          type="button"
          className={styles.quietLink}
          disabled={!!busy}
          onClick={() => void update("GET")}
        >
          {busy === "refresh" ? "Obnovujem…" : "Obnoviť"}
        </button>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
          <TechnicalSupport />
        </p>
      ) : null}
      {message ? (
        <p className={styles.status} role="status" aria-live="polite">
          {message}
        </p>
      ) : null}

      <section className={styles.panel}>
        <h2>
          Používatelia{" "}
          <span className={styles.badge}>{access.editors.length}</span>
        </h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void update("POST", email);
          }}
          className={accessStyles.form}
        >
          <label className={styles.field}>
            Google e-mail
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!!busy}
              placeholder="meno@gmail.com"
            />
          </label>
          <label className={styles.field}>
            Rola nového používateľa
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as EditorGrantRole)
              }
              disabled={!!busy}
            >
              {EDITOR_ROLES.map((value) => (
                <option key={value} value={value}>
                  {EDITOR_ROLE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <button
            className={styles.button}
            type="submit"
            disabled={!!busy || !email.trim()}
          >
            {busy === "grant" ? "Pridávam…" : "Pridať prístup"}
          </button>
        </form>
        {access.editors.length ? (
          <ul className={accessStyles.people}>
            {access.editors.map((editor) => (
              <li key={editor.email}>
                <div>
                  <strong>{editor.email}</strong>
                  <small>
                    Pridal {editor.grantedBy} ·{" "}
                    {new Intl.DateTimeFormat("sk-SK", {
                      dateStyle: "medium",
                      timeZone: "Europe/Bratislava"
                    }).format(new Date(editor.grantedAt))}
                  </small>
                </div>
                <label className={styles.field}>
                  Rola
                  <select
                    aria-label={`Rola účtu ${editor.email}`}
                    value={editor.role}
                    disabled={!!busy}
                    onChange={(event) =>
                      void update(
                        "PATCH",
                        editor.email,
                        event.target.value as EditorGrantRole,
                        editor.role
                      )
                    }
                  >
                    {EDITOR_ROLES.map((value) => (
                      <option key={value} value={value}>
                        {EDITOR_ROLE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={styles.remove}
                  disabled={!!busy}
                  title="Odobrať prístup"
                  aria-label={`Odobrať prístup účtu ${editor.email}`}
                  aria-busy={busy === editor.email}
                  onClick={() => void update("DELETE", editor.email)}
                >
                  <Icon name="minus" size={17} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.hint}>Zatiaľ žiadni ďalší používatelia.</p>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Správcovia</h2>
        <ul className={accessStyles.people}>
          {access.administrators.map((administrator) => (
            <li key={administrator}>
              <strong>{administrator}</strong>
              <span className={styles.badge}>Chránený účet</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
