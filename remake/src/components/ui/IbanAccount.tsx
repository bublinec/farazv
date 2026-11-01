"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { TechnicalSupport } from "./TechnicalSupport";
import styles from "./IbanAccount.module.css";

export function IbanAccount({
  iban,
  label = "Farský IBAN"
}: {
  iban: string;
  label?: string;
}) {
  const [message, setMessage] = useState("");
  const copied = message === "IBAN bol skopírovaný.";

  async function copy() {
    setMessage("");
    try {
      await navigator.clipboard.writeText(iban.replace(/\s/g, ""));
      setMessage("IBAN bol skopírovaný.");
    } catch {
      setMessage("IBAN môžete označiť a skopírovať ručne.");
    }
  }

  return (
    <div className={styles.account}>
      <span className={styles.label}>{label}</span>
      <div className={styles.number}>
        <strong>{iban}</strong>
        <button
          type="button"
          onClick={copy}
          aria-label={`Skopírovať IBAN: ${label}`}
          title={copied ? "IBAN bol skopírovaný" : "Skopírovať IBAN"}
        >
          <Icon name={copied ? "check" : "copy"} size={20} />
        </button>
      </div>
      <p
        className={message && !copied ? styles.status : "srOnly"}
        role="status"
      >
        {message}
        {message && !copied ? <TechnicalSupport /> : null}
      </p>
    </div>
  );
}
