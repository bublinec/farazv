"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
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
  async function copy() {
    try {
      await navigator.clipboard.writeText(iban.replace(/\s/g, ""));
      setMessage("IBAN bol skopírovaný.");
    } catch {
      setMessage("IBAN môžete označiť a skopírovať ručne.");
    }
  }
  return (
    <section className={styles.section}>
      <div
        className={`container ${styles.inner} ${!qr ? styles.withoutQr : ""}`}
      >
        {qr ? (
          <div className={styles.qr}>
            <img
              src={qr.src}
              width={qr.width}
              height={qr.height}
              alt={qr.alt}
              loading="lazy"
            />
          </div>
        ) : null}
        <div className={styles.content}>
          <p className="eyebrow">Ďakujeme za vašu štedrosť</p>
          <h2>
            Aj malý dar pomáha
            <br />
            veľkým veciam.
          </h2>
          <p>
            Údržba našich kostolov a život farnosti sú možné aj vďaka vám.
            Prispieť môžete na farský účet{qr ? " alebo načítaním QR kódu" : ""}
            .
          </p>
          <div className={styles.account}>
            <span>Farský IBAN</span>
            <strong>{iban}</strong>
            <button type="button" onClick={copy}>
              Skopírovať IBAN
              <Icon name="arrow-right" size={15} />
            </button>
          </div>
          <p className={styles.status} role="status">
            {message || "Pán Boh zaplať za každý milodar."}
          </p>
        </div>
      </div>
    </section>
  );
}
