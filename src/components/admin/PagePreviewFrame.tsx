"use client";

import { useState } from "react";
import type { ContentRecordFor } from "@/content/documents";
import styles from "./PageForm.module.css";
import adminStyles from "./Admin.module.css";

const devices = [
  { id: "mobile", label: "Mobil", width: 390 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "desktop", label: "Počítač", width: 1280 }
] as const;

/** The saved page in the real public layout, at the chosen screen width. */
export function PagePreviewFrame({
  record,
  dirty
}: {
  record: ContentRecordFor<"page">;
  dirty: boolean;
}) {
  const [device, setDevice] =
    useState<(typeof devices)[number]["id"]>("mobile");
  const width = devices.find((entry) => entry.id === device)!.width;
  const source = `/admin/nahlad/${encodeURIComponent(record.id)}?v=${
    record.version
  }`;

  return (
    <div className={styles.previewPane}>
      <div className={styles.previewBar}>
        <div
          className={styles.segmented}
          role="group"
          aria-label="Šírka náhľadu"
        >
          {devices.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={device === entry.id}
              onClick={() => setDevice(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <a href={source} target="_blank" rel="noopener noreferrer">
          Otvoriť na celú obrazovku ↗
        </a>
      </div>
      {dirty ? (
        <p className={adminStyles.notice} role="status">
          Náhľad ukazuje poslednú uloženú verziu. Neuložené zmeny sa zobrazia po
          uložení.
        </p>
      ) : null}
      <div className={styles.previewViewport}>
        <iframe
          key={source}
          title="Náhľad stránky"
          src={source}
          className={styles.previewFrame}
          style={{ width: `min(100%, ${width}px)` }}
        />
      </div>
    </div>
  );
}
