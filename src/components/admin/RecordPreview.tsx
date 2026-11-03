"use client";

import Link from "next/link";
import type { ContentRecord, SettingsDocument } from "@/content/documents";
import { MediaImage } from "@/components/ui/MediaImage";
import { getMassLabel } from "@/lib/mass";
import { useAdminSection } from "./AdminSectionContext";
import { RecordLivePreview } from "./RecordLivePreview";
import styles from "./Admin.module.css";

function PreviewSettings({ document }: { document: SettingsDocument }) {
  const days = [
    "Nedeľa",
    "Pondelok",
    "Utorok",
    "Streda",
    "Štvrtok",
    "Piatok",
    "Sobota"
  ];
  return (
    <>
      <h1>{document.name}</h1>
      <div className={styles.panel}>
        <h2>Kontakty</h2>
        <p>
          {document.address}
          <br />
          {document.phone}
          <br />
          {document.email}
          <br />
          {document.mobile}
          <br />
          {document.ico ? `IČO: ${document.ico}` : ""}
        </p>
        {document.mapLink ? (
          <p>
            <a href={document.mapLink}>Zobraziť na mape</a>
          </p>
        ) : null}
        {document.contactNote ? <p>{document.contactNote}</p> : null}
        {document.priests?.map((priest, index) => (
          <div key={index}>
            <h3>
              {priest.name} · {priest.role}
            </h3>
            <p>
              {priest.phone} {priest.email}
            </p>
            {priest.image ? (
              <MediaImage image={priest.image} sizes="200px" />
            ) : null}
          </div>
        ))}
      </div>
      <div className={styles.panel}>
        <h2>Úradné hodiny</h2>
        {document.officeHours.map((row, index) => (
          <p key={index}>
            {row.day} · {row.time}
          </p>
        ))}
        {document.officeNote ? <p>{document.officeNote}</p> : null}
        <h2>Náuky</h2>
        {document.preparationMeetings.map((row, index) => (
          <p key={index}>
            {row.name} · {row.time}
          </p>
        ))}
        <p>{document.preparationNote}</p>
      </div>
      <div className={styles.panel}>
        <h2>Podpora farnosti</h2>
        <p>{document.iban}</p>
        {document.donationQr ? (
          <MediaImage image={document.donationQr} sizes="250px" />
        ) : null}
      </div>
      <div className={styles.panel}>
        <h2>Pravidelné časy</h2>
        {[1, 2, 3, 4, 5, 6, 0].map((key) => (
          <p key={key}>
            <strong>{days[key]}:</strong>{" "}
            {document.regularSchedule[key]
              ?.map(
                (mass) =>
                  `${mass.time}${
                    getMassLabel(mass) ? ` (${getMassLabel(mass)})` : ""
                  }`
              )
              .join(" · ") || "Nie sú nastavené"}
          </p>
        ))}
      </div>
    </>
  );
}

export function RecordPreview({ record }: { record: ContentRecord }) {
  useAdminSection(record.kind);

  return (
    <div>
      <header className={styles.heading}>
        <h1>{record.readOnly ? "Náhľad histórie" : "Súkromný náhľad"}</h1>
        <Link href={`/admin/records/${encodeURIComponent(record.id)}`}>
          ← Späť na úpravu
        </Link>
      </header>
      {record.kind === "settings" ? (
        <PreviewSettings document={record.draft} />
      ) : (
        <RecordLivePreview record={record} />
      )}
    </div>
  );
}
