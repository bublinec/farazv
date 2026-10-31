"use client";

import type { ReactNode } from "react";
import type { Mass } from "@/content/types";
import { getMassLabel } from "@/lib/mass";
import styles from "./Admin.module.css";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
  wide = false,
  multiline = false,
  maxLength
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  hint?: ReactNode;
  wide?: boolean;
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <label className={`${styles.field} ${wide ? styles.wide : ""}`}>
      {label}
      {multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
        />
      )}{" "}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function MassFields({
  masses,
  onChange,
  template = false
}: {
  masses: Mass[];
  onChange: (value: Mass[]) => void;
  template?: boolean;
}) {
  function update(index: number, key: keyof Mass, value: string) {
    onChange(
      masses.map((mass, i) => {
        if (i !== index) return mass;
        if (key === "label") {
          const { location, ...rest } = mass;
          return { ...rest, label: value };
        }
        return { ...mass, [key]: value };
      })
    );
  }

  return (
    <div>
      {masses.map((mass, index) => (
        <div className={styles.mass} key={index}>
          <div className={styles.massHeading}>
            <strong>
              {template ? "Pravidelná svätá omša" : "Svätá omša"} {index + 1}
            </strong>
            <button
              type="button"
              className={styles.remove}
              onClick={() => onChange(masses.filter((_, i) => i !== index))}
            >
              Odobrať omšu {index + 1}
            </button>
          </div>
          <div className={styles.fields}>
            <Field
              label="Čas"
              type="time"
              value={mass.time}
              onChange={(value) => update(index, "time", value)}
            />
            <Field
              label="Označenie"
              value={getMassLabel(mass)}
              onChange={(value) => update(index, "label", value)}
              hint="Napríklad Lieskovec, nemocnica alebo rodinná svätá omša. Prázdne = farský kostol."
            />
            {!template ? (
              <>
                <Field
                  label="Celebrant"
                  value={mass.celebrant}
                  onChange={(value) => update(index, "celebrant", value)}
                />
                <Field
                  label="Úmysel"
                  value={mass.intention}
                  onChange={(value) => update(index, "intention", value)}
                  wide
                  multiline
                />
              </>
            ) : null}
          </div>
          {index > 0 ? (
            <button
              type="button"
              className={styles.remove}
              onClick={() => {
                const items = [...masses];
                [items[index - 1], items[index]] = [
                  items[index],
                  items[index - 1]
                ];
                onChange(items);
              }}
            >
              Posunúť vyššie
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        className={styles.secondary}
        onClick={() => onChange([...masses, { time: "" }])}
      >
        + Pridať svätú omšu
      </button>
    </div>
  );
}

export function StringList({
  values,
  onChange,
  label
}: {
  values: string[];
  onChange: (values: string[]) => void;
  label: string;
}) {
  return (
    <div>
      {values.map((value, index) => (
        <div key={index} className={styles.inlineRow}>
          <label
            className={`${styles.field} ${styles.wide}`}
            style={{ gridColumn: "1 / 3" }}
          >
            {label} {index + 1}
            <textarea
              value={value}
              onChange={(event) =>
                onChange(
                  values.map((old, i) =>
                    i === index ? event.target.value : old
                  )
                )
              }
            />
          </label>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            Odobrať
          </button>
        </div>
      ))}
      <button
        type="button"
        className={styles.secondary}
        onClick={() => onChange([...values, ""])}
      >
        + Pridať {label.toLocaleLowerCase("sk")}
      </button>
    </div>
  );
}
