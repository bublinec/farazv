"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorAccessList } from "@/content/editor-access";
import { readAdminJson } from "./admin-api";
import styles from "./Admin.module.css";
import accessStyles from "./EditorAccess.module.css";

export function EditorAccess({
  initialAccess
}: {
  initialAccess: EditorAccessList;
}) {
  const [access, setAccess] = useState(initialAccess);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function update(method: "GET" | "POST" | "DELETE", value = "") {
    if (request.current) return;
    const address = value.trim().toLowerCase();
    if (
      method === "DELETE" &&
      !window.confirm(
        `Odobrať účtu ${address} redaktorský prístup? Odobratie platí aj pre už prihláseného redaktora.`
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
              body: JSON.stringify({ email: address })
            })
      });
      const next: EditorAccessList = await readAdminJson(response);
      if (controller.signal.aborted) return;
      setAccess(next);
      if (method === "POST") {
        setEmail("");
        setMessage(`Redaktor ${address} sa teraz môže prihlásiť cez Google.`);
      } else if (method === "DELETE") {
        setMessage(`Redaktorský prístup účtu ${address} bol odobratý.`);
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
        </p>
      ) : null}
      {message ? (
        <p className={styles.status} role="status" aria-live="polite">
          {message}
        </p>
      ) : null}

      <section className={styles.panel}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void update("POST", email);
          }}
          className={accessStyles.form}
        >
          <label className={styles.field}>
            Google e-mail nového redaktora
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
              aria-describedby="editor-access-hint"
            />
          </label>
          <button
            className={styles.button}
            type="submit"
            disabled={!!busy || !email.trim()}
          >
            {busy === "grant" ? "Pridávam…" : "Pridať"}
          </button>
        </form>
        <p id="editor-access-hint" className={styles.hint}>
          Redaktor upravuje a zverejňuje obsah. Prístupy spravuje iba správca.
        </p>
      </section>

      <section className={styles.panel}>
        <h2>
          Redaktori{" "}
          <span className={styles.badge}>{access.editors.length}</span>
        </h2>
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
                <button
                  type="button"
                  className={styles.danger}
                  disabled={!!busy}
                  onClick={() => void update("DELETE", editor.email)}
                >
                  {busy === editor.email ? "Odoberám…" : "Odobrať prístup"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.hint}>Zatiaľ žiadni redaktori.</p>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Správcovia</h2>
        <ul className={accessStyles.people}>
          {access.administrators.map((administrator) => (
            <li key={administrator}>
              <strong>{administrator}</strong>
              <span className={styles.badge}>Správca</span>
            </li>
          ))}
        </ul>
        <p className={styles.hint}>
          Správcovia upravujú obsah aj prístupy. Tieto chránené účty sa tu
          nedajú odobrať.
        </p>
      </section>

      <details className={accessStyles.help}>
        <summary>Nový redaktor sa nevie prihlásiť cez Google?</summary>
        <p>
          Skontrolujte, či pri prihlásení vybral presne tú adresu, ktorú ste
          pridali. Nový účet ani ďalšie heslo nepotrebuje. Pri pracovnom Google
          účte môže prihlásenie obmedzovať správca jeho organizácie.
        </p>
      </details>
    </div>
  );
}
