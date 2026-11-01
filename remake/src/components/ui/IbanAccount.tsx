"use client";

import { Fragment, useState } from "react";
import { Icon } from "./Icon";
import { TechnicalSupport } from "./TechnicalSupport";
import styles from "./IbanAccount.module.css";

const copyMessages = {
  idle: "",
  copied: "IBAN bol skopírovaný.",
  manual: "IBAN môžete označiť a skopírovať ručne."
};

export function IbanAccount({
  iban,
  label = "Farský IBAN"
}: {
  iban: string;
  label?: string;
}) {
  const [copyState, setCopyState] = useState<keyof typeof copyMessages>("idle");
  const copied = copyState === "copied";
  const needsManualCopy = copyState === "manual";
  const compactIban = iban.replace(/\s/g, "");
  const groups = compactIban.match(/.{1,4}/g) ?? [];

  async function copy() {
    setCopyState("idle");
    try {
      await navigator.clipboard.writeText(compactIban);
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <div className={styles.account}>
      <span className={styles.label}>{label}</span>
      <div className={styles.number}>
        <strong>
          {groups.map((group, index) => (
            <Fragment key={index}>
              {index > 0 ? " " : null}
              <span className={styles.group}>{group}</span>
            </Fragment>
          ))}
        </strong>
        <button
          type="button"
          onClick={copy}
          aria-label={`Skopírovať IBAN: ${label}`}
          title={copied ? "IBAN bol skopírovaný" : "Skopírovať IBAN"}
        >
          <Icon name={copied ? "check" : "copy"} size={20} />
        </button>
      </div>
      <p className={needsManualCopy ? styles.status : "srOnly"} role="status">
        {copyMessages[copyState]}
        {needsManualCopy ? <TechnicalSupport /> : null}
      </p>
    </div>
  );
}
