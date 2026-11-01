"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/MediaImage";
import { churchDetails } from "@/content/church-details";
import type { MediaAsset } from "@/content/types";
import styles from "./DonationSection.module.css";

export function DonationSection({
  iban,
  qr
}: {
  iban: string;
  qr?: MediaAsset;
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
    <section className={styles.section}>
      <div className={styles.background} aria-hidden="true">
        <MediaImage image={{ ...churchDetails.chapel, alt: "" }} sizes="55vw" />
      </div>
      <div
        className={`container ${styles.inner} ${!qr ? styles.withoutQr : ""}`}
      >
        {qr ? (
          <figure className={styles.qr}>
            <img
              src={qr.src}
              width={qr.width}
              height={qr.height}
              alt={qr.alt}
              loading="lazy"
            />
            <figcaption>Načítajte v bankovej aplikácii</figcaption>
          </figure>
        ) : null}
        <div className={styles.content}>
          <h2>Aj malý dar pomáha veľkým veciam.</h2>
          <p>Váš príspevok pomáha starať sa o naše kostoly a život farnosti.</p>
          <div className={styles.account}>
            <span>Farský IBAN</span>
            <div className={styles.accountNumber}>
              <strong>{iban}</strong>
              <button
                type="button"
                onClick={copy}
                aria-label="Skopírovať IBAN"
                title={copied ? "IBAN bol skopírovaný" : "Skopírovať IBAN"}
              >
                <Icon name={copied ? "check" : "copy"} size={20} />
              </button>
            </div>
          </div>
          <p className={styles.thanks}>Pán Boh zaplať za každý milodar.</p>
          <p
            className={message && !copied ? styles.status : "srOnly"}
            role="status"
          >
            {message}
            {message && !copied ? <TechnicalSupport /> : null}
          </p>
        </div>
      </div>
    </section>
  );
}
