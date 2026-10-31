import type { ReactElement } from "react";
import { formatRecordDate } from "./admin-format";
import Link from "next/link";
import type {
  BulletinDocument,
  ContentRecord,
  EditorialDocument,
  SettingsDocument
} from "@/content/documents";

import { MediaImage } from "@/components/ui/MediaImage";
import { RichText } from "@/components/editorial/RichText";
import { isSafeEditorialLink } from "@/lib/editorial";
import { contentBlocksToRichText } from "@/lib/rich-text";
import { getMassLabel } from "@/lib/mass";
import styles from "./Admin.module.css";

function PreviewBulletin({ document }: { document: BulletinDocument }) {
  return (
    <>
      <h1>Farské oznamy · od {formatRecordDate(document.weekStart)}</h1>
      <p className={styles.hint}>
        Náhľad tohto pondelka až nedele. Predchádzajúca nedeľa sa na verejnom
        webe doplní z vlastniaceho zverejneného týždňa.
      </p>
      {document.days.map((day) => (
        <section className={styles.previewDay} key={day.date}>
          <h2>
            {formatRecordDate(day.date, {
              weekday: "long",
              day: "numeric",
              month: "long"
            })}
          </h2>
          {day.liturgy ? <p>{day.liturgy}</p> : null}
          {day.status === "no-masses" ? (
            <p>V tento deň nie je svätá omša.</p>
          ) : day.status === "unpublished" ? (
            <p>
              Podrobný rozpis nie je zverejnený. Verejná stránka použije
              označené pravidelné časy, ak sú nastavené.
            </p>
          ) : (
            day.masses.map((mass, index) => (
              <div className={styles.previewMass} key={index}>
                <strong>{mass.time}</strong>
                <div>
                  {getMassLabel(mass) ? (
                    <strong>
                      {getMassLabel(mass)}
                      <br />
                    </strong>
                  ) : null}
                  {mass.intention || ""}
                  {mass.celebrant ? (
                    <small>
                      <br />
                      {mass.celebrant}
                    </small>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </section>
      ))}
      <h2>Farské oznamy</h2>
      {document.announcements.map((text, index) => (
        <p key={index} style={{ whiteSpace: "pre-wrap" }}>
          {text}
        </p>
      ))}
      {document.donations?.length ? (
        <>
          <h2>Dary a zbierky</h2>
          <ul>
            {document.donations.map((donation, index) => (
              <li key={index}>
                {donation.category ? (
                  <strong>{donation.category}: </strong>
                ) : null}
                {donation.label}
                {donation.amount
                  ? `${donation.label ? " · " : ""}${donation.amount}`
                  : ""}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

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

function PreviewEditorial({ document }: { document: EditorialDocument }) {
  return (
    <article>
      <h1>{document.title || "Koncept bez názvu"}</h1>
      <p className={styles.hint}>
        {formatRecordDate(document.date)}
        {document.author ? ` · ${document.author}` : ""}
      </p>
      {document.cover ? (
        <MediaImage image={document.cover} sizes="850px" priority />
      ) : null}
      {document.excerpt ? (
        <p style={{ fontSize: "1.15rem", lineHeight: 1.8 }}>
          {document.excerpt}
        </p>
      ) : null}
      <RichText
        document={document.body ?? contentBlocksToRichText(document.blocks)}
      />
      {document.posterDestination &&
      isSafeEditorialLink(document.posterDestination) ? (
        <p>
          <a href={document.posterDestination}>Viac informácií ↗</a>
        </p>
      ) : null}
    </article>
  );
}

function PreviewContent({ record }: { record: ContentRecord }): ReactElement {
  switch (record.kind) {
    case "bulletin":
      return <PreviewBulletin document={record.draft} />;
    case "settings":
      return <PreviewSettings document={record.draft} />;
    case "article":
    case "news":
    case "notice":
    case "event":
      return <PreviewEditorial document={record.draft} />;
  }
}

export function RecordPreview({ record }: { record: ContentRecord }) {
  return (
    <div className={styles.preview}>
      <aside className={styles.previewHeader}>
        <strong>
          Súkromný náhľad {record.readOnly ? "histórie" : "konceptu"}
        </strong>
        <p>
          Túto stránku vidia iba prihlásení oprávnení editori. Zobrazuje uložený
          koncept verzie {record.version}.
        </p>
        <Link href={`/admin/records/${encodeURIComponent(record.id)}`}>
          ← Späť {record.readOnly ? "na historický záznam" : "na úpravu"}
        </Link>
      </aside>
      <PreviewContent record={record} />
    </div>
  );
}
