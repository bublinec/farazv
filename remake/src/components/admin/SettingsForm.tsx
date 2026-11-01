"use client";

import { useState } from "react";
import type { SettingsDocument } from "@/content/documents";
import { Field } from "./Fields";
import { ImageField } from "./MediaPicker";
import { Icon } from "@/components/ui/Icon";
import styles from "./Admin.module.css";
import formStyles from "./AdminForms.module.css";

type Priest = NonNullable<SettingsDocument["priests"]>[number];

function PriestEditor({
  priest,
  index,
  onChange,
  onRemove
}: {
  priest: Priest;
  index: number;
  onChange: (priest: Priest) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(!priest.name);

  function update<K extends keyof Priest>(key: K, value: Priest[K]) {
    onChange({
      ...priest,
      [key]: value,
      ...(key === "name" && typeof value === "string" && priest.image
        ? { image: { ...priest.image, alt: value.trim() || priest.image.alt } }
        : {})
    });
  }

  return (
    <details
      className={formStyles.person}
      data-field={`priests.${index}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        {priest.name || "Nový kontakt"}
        {priest.role ? <small>{priest.role}</small> : null}
      </summary>
      <div className={formStyles.personContent}>
        <div className={styles.fields}>
          <Field
            label="Meno"
            path={`priests.${index}.name`}
            value={priest.name}
            onChange={(value) => update("name", value)}
          />
          <Field
            label="Funkcia"
            path={`priests.${index}.role`}
            value={priest.role}
            onChange={(value) => update("role", value)}
          />
          <Field
            label="Telefón"
            type="tel"
            path={`priests.${index}.phone`}
            value={priest.phone}
            onChange={(value) => update("phone", value)}
          />
          <Field
            label="E-mail"
            type="email"
            path={`priests.${index}.email`}
            value={priest.email}
            onChange={(value) => update("email", value)}
          />
          <div className={`${styles.wide} ${formStyles.portrait}`}>
            <ImageField
              portrait
              label="Fotografia"
              imageTitle={priest.name}
              path={`priests.${index}.image`}
              value={priest.image}
              onChange={(image) => update("image", image)}
            />
          </div>
        </div>
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          title="Odobrať kontakt"
          aria-label={`Odobrať kontakt ${priest.name || index + 1}`}
        >
          <Icon name="minus" size={17} />
        </button>
      </div>
    </details>
  );
}

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
        <h2>Kontaktné údaje</h2>
        <div className={styles.fields}>
          <Field
            label="Telefón farského úradu"
            type="tel"
            value={document.phone}
            path="phone"
            onChange={(value) => update("phone", value)}
          />
          <Field
            label="E-mail farského úradu"
            type="email"
            value={document.email}
            path="email"
            onChange={(value) => update("email", value)}
          />
          <Field
            label="Mobilný kontakt"
            type="tel"
            value={document.mobile}
            path="mobile"
            onChange={(value) => update("mobile", value)}
          />
          <Field
            label="IČO"
            value={document.ico}
            path="ico"
            onChange={(value) => update("ico", value)}
          />
          <Field
            label="Poznámka ku kontaktom"
            value={document.contactNote}
            path="contactNote"
            onChange={(value) => update("contactNote", value)}
            wide
            multiline
          />
          <Field
            label="Poštová adresa"
            value={document.address}
            path="address"
            onChange={(value) => update("address", value)}
            wide
            multiline
          />
        </div>
      </section>
      <section className={styles.panel}>
        <h2>Úradné hodiny</h2>
        <Field
          label="Poznámka k úradným hodinám"
          value={document.officeNote}
          path="officeNote"
          onChange={(value) => update("officeNote", value)}
          multiline
        />

        {document.officeHours.map((row, index) => (
          <div
            className={styles.inlineRow}
            key={index}
            data-field={`officeHours.${index}`}
          >
            <Field
              label="Deň / dni"
              path={`officeHours.${index}.day`}
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
              path={`officeHours.${index}.time`}
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
              title="Odobrať úradné hodiny"
              aria-label={`Odobrať úradné hodiny ${row.day || index + 1}`}
              onClick={() =>
                update(
                  "officeHours",
                  document.officeHours.filter((_, i) => i !== index)
                )
              }
            >
              <Icon name="minus" size={17} />
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
        <h2>Náuky</h2>
        {document.preparationMeetings.map((row, index) => (
          <div
            className={styles.inlineRow}
            key={index}
            data-field={`preparationMeetings.${index}`}
          >
            <Field
              label="Náuka"
              path={`preparationMeetings.${index}.name`}
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
              path={`preparationMeetings.${index}.time`}
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
              title="Odobrať náuku"
              aria-label={`Odobrať náuku ${row.name || index + 1}`}
              onClick={() =>
                update(
                  "preparationMeetings",
                  document.preparationMeetings.filter((_, i) => i !== index)
                )
              }
            >
              <Icon name="minus" size={17} />
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
            label="Poznámka k náukám"
            value={document.preparationNote}
            path="preparationNote"
            onChange={(value) => update("preparationNote", value)}
            multiline
          />
        </div>
      </section>
      <section className={styles.panel}>
        <h2>Kňazi a kontakty</h2>
        {(document.priests ?? []).map((priest, index) => (
          <PriestEditor
            key={index}
            priest={priest}
            index={index}
            onChange={(value) =>
              update(
                "priests",
                document.priests?.map((row, i) => (i === index ? value : row))
              )
            }
            onRemove={() =>
              update(
                "priests",
                document.priests?.filter((_, i) => i !== index)
              )
            }
          />
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
        <h2>Podpora farnosti</h2>
        <Field
          label="IBAN"
          value={document.iban}
          path="iban"
          onChange={(value) => update("iban", value)}
        />
        <ImageField
          label="Platobný QR kód"
          value={document.donationQr}
          path="donationQr"
          onChange={(image) => update("donationQr", image)}
        />
      </section>
    </>
  );
}
