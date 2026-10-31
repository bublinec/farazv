"use client";

import type { SettingsDocument } from "@/content/documents";
import { Field, MassFields } from "./Fields";
import { ImageField } from "./MediaPicker";
import styles from "./Admin.module.css";

const weekdays = [
  { key: 1, name: "Pondelok" },
  { key: 2, name: "Utorok" },
  { key: 3, name: "Streda" },
  { key: 4, name: "Štvrtok" },
  { key: 5, name: "Piatok" },
  { key: 6, name: "Sobota" },
  { key: 0, name: "Nedeľa" }
];

export function SettingsForm({
  document,
  onChange
}: {
  document: SettingsDocument;
  onChange: (doc: SettingsDocument) => void;
}) {
  function update<K extends keyof SettingsDocument>(
    key: K,
    value: SettingsDocument[K]
  ) {
    onChange({ ...document, [key]: value });
  }

  return (
    <>
      <section className={styles.panel}>
        <h2>Farnosť a kontakty</h2>
        <div className={styles.fields}>
          <Field
            label="Celý názov farnosti"
            value={document.name}
            onChange={(value) => update("name", value)}
            wide
          />
          <Field
            label="Krátky názov"
            value={document.shortName}
            onChange={(value) => update("shortName", value)}
          />
          <Field
            label="Mesto / miesto"
            value={document.location}
            onChange={(value) => update("location", value)}
          />
          <Field
            label="Telefón farského úradu"
            type="tel"
            value={document.phone}
            onChange={(value) => update("phone", value)}
          />
          <Field
            label="E-mail farského úradu"
            type="email"
            value={document.email}
            onChange={(value) => update("email", value)}
          />
          <Field
            label="Mobilný kontakt"
            type="tel"
            value={document.mobile}
            onChange={(value) => update("mobile", value)}
          />
          <Field
            label="IČO"
            value={document.ico}
            onChange={(value) => update("ico", value)}
          />
          <Field
            label="Odkaz na mapu"
            value={document.mapLink}
            onChange={(value) => update("mapLink", value)}
            hint="https://… Nevkladajte HTML ani iframe."
            wide
          />
          <Field
            label="Poznámka ku kontaktom"
            value={document.contactNote}
            onChange={(value) => update("contactNote", value)}
            wide
            multiline
          />
          <Field
            label="Poštová adresa"
            value={document.address}
            onChange={(value) => update("address", value)}
            wide
            multiline
          />
        </div>
      </section>
      <section className={styles.panel}>
        <h2>Kňazi a kontaktné karty</h2>
        {(document.priests ?? []).map((priest, index) => (
          <div className={styles.mass} key={index}>
            <div className={styles.massHeading}>
              <strong>Kontakt {index + 1}</strong>
              <button
                className={styles.remove}
                type="button"
                onClick={() =>
                  update(
                    "priests",
                    document.priests?.filter((_, i) => i !== index)
                  )
                }
              >
                Odobrať kontakt
              </button>
            </div>
            <div className={styles.fields}>
              <Field
                label="Meno"
                value={priest.name}
                onChange={(value) =>
                  update(
                    "priests",
                    document.priests?.map((row, i) =>
                      i === index ? { ...row, name: value } : row
                    )
                  )
                }
              />
              <Field
                label="Funkcia / popis"
                value={priest.role}
                onChange={(value) =>
                  update(
                    "priests",
                    document.priests?.map((row, i) =>
                      i === index ? { ...row, role: value } : row
                    )
                  )
                }
              />
              <Field
                label="Telefón"
                type="tel"
                value={priest.phone}
                onChange={(value) =>
                  update(
                    "priests",
                    document.priests?.map((row, i) =>
                      i === index ? { ...row, phone: value } : row
                    )
                  )
                }
              />
              <Field
                label="E-mail"
                type="email"
                value={priest.email}
                onChange={(value) =>
                  update(
                    "priests",
                    document.priests?.map((row, i) =>
                      i === index ? { ...row, email: value } : row
                    )
                  )
                }
              />
              <div className={styles.wide}>
                <ImageField
                  label="Fotografia kontaktu"
                  value={priest.image}
                  onChange={(image) =>
                    update(
                      "priests",
                      document.priests?.map((row, i) =>
                        i === index ? { ...row, image } : row
                      )
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <button
          className={styles.secondary}
          type="button"
          onClick={() =>
            update("priests", [
              ...(document.priests ?? []),
              { name: "", role: "" }
            ])
          }
        >
          + Pridať kontakt
        </button>
      </section>
      <section className={styles.panel}>
        <h2>Úradné hodiny</h2>
        <Field
          label="Poznámka k úradným hodinám"
          value={document.officeNote}
          onChange={(value) => update("officeNote", value)}
          multiline
        />

        {document.officeHours.map((row, index) => (
          <div className={styles.inlineRow} key={index}>
            <Field
              label="Deň / dni"
              value={row.day}
              onChange={(value) =>
                update(
                  "officeHours",
                  document.officeHours.map((item, i) =>
                    i === index ? { ...item, day: value } : item
                  )
                )
              }
            />
            <Field
              label="Čas / poznámka"
              value={row.time}
              onChange={(value) =>
                update(
                  "officeHours",
                  document.officeHours.map((item, i) =>
                    i === index ? { ...item, time: value } : item
                  )
                )
              }
            />
            <button
              className={styles.remove}
              type="button"
              onClick={() =>
                update(
                  "officeHours",
                  document.officeHours.filter((_, i) => i !== index)
                )
              }
            >
              Odobrať
            </button>
          </div>
        ))}
        <button
          className={styles.secondary}
          type="button"
          onClick={() =>
            update("officeHours", [
              ...document.officeHours,
              { day: "", time: "" }
            ])
          }
        >
          + Pridať úradné hodiny
        </button>
      </section>
      <section className={styles.panel}>
        <h2>Náuky a prípravné stretnutia</h2>
        {document.preparationMeetings.map((row, index) => (
          <div className={styles.inlineRow} key={index}>
            <Field
              label="Názov náuky"
              value={row.name}
              onChange={(value) =>
                update(
                  "preparationMeetings",
                  document.preparationMeetings.map((item, i) =>
                    i === index ? { ...item, name: value } : item
                  )
                )
              }
            />
            <Field
              label="Čas / podmienky"
              value={row.time}
              onChange={(value) =>
                update(
                  "preparationMeetings",
                  document.preparationMeetings.map((item, i) =>
                    i === index ? { ...item, time: value } : item
                  )
                )
              }
            />
            <button
              className={styles.remove}
              type="button"
              onClick={() =>
                update(
                  "preparationMeetings",
                  document.preparationMeetings.filter((_, i) => i !== index)
                )
              }
            >
              Odobrať
            </button>
          </div>
        ))}
        <button
          className={styles.secondary}
          type="button"
          onClick={() =>
            update("preparationMeetings", [
              ...document.preparationMeetings,
              { name: "", time: "" }
            ])
          }
        >
          + Pridať náuku
        </button>
        <div style={{ marginTop: "1rem" }}>
          <Field
            label="Spoločná poznámka k náukám"
            value={document.preparationNote}
            onChange={(value) => update("preparationNote", value)}
            multiline
          />
        </div>
      </section>
      <section className={styles.panel}>
        <h2>Podpora farnosti</h2>
        <Field
          label="IBAN"
          value={document.iban}
          onChange={(value) => update("iban", value)}
          hint="Účet aj platobný QR kód pred zverejnením overte."
        />
        <ImageField
          label="Platobný QR kód"
          value={document.donationQr}
          onChange={(image) => update("donationQr", image)}
        />
      </section>
      <section className={styles.panel}>
        <h2>Pravidelná šablóna svätých omší</h2>
        <div className={styles.notice}>
          Táto šablóna sa používa pre nové týždne a ako jasne označený náhradný
          rozpis. Zmena neprepíše už vytvorené alebo zverejnené týždne. Vyplňte
          iba overené časy, miesta a označenia; nepatria sem úmysly ani
          celebranti.
        </div>
        {weekdays.map(({ key, name }) => (
          <details className={styles.day} key={key}>
            <summary>
              {name}{" "}
              <span className={styles.badge}>
                {document.regularSchedule?.[key]
                  ?.map((mass) => mass.time)
                  .join(" · ") || "Časy nie sú nastavené"}
              </span>
            </summary>
            <div className={styles.dayContent}>
              <MassFields
                template
                masses={document.regularSchedule?.[key] ?? []}
                onChange={(masses) =>
                  update("regularSchedule", {
                    ...document.regularSchedule,
                    [key]: masses
                  })
                }
              />
            </div>
          </details>
        ))}
      </section>
    </>
  );
}
