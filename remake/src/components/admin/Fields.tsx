"use client";

import { useId, type ReactNode } from "react";
import type { Mass } from "@/content/types";
import { getMassLabel } from "@/lib/mass";
import { useFieldError } from "./EditorValidation";
import styles from "./Admin.module.css";
import formStyles from "./AdminForms.module.css";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
  wide = false,
  multiline = false,
  maxLength,
  path,
  readOnly = false,
  autoCapitalize,
  spellCheck
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
  hint?: ReactNode;
  wide?: boolean;
  multiline?: boolean;
  maxLength?: number;
  path?: string;
  readOnly?: boolean;
  autoCapitalize?: string;
  spellCheck?: boolean;
}) {
  const error = useFieldError(path);
  const hintId = useId();
  const errorId = useId();
  const describedBy =
    [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") ||
    undefined;

  return (
    <label
      className={`${styles.field} ${wide ? styles.wide : ""}`}
      data-field={path}
    >
      {label}
      {multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          readOnly={readOnly}
          autoCapitalize={autoCapitalize}
          spellCheck={spellCheck}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          readOnly={readOnly}
          autoCapitalize={autoCapitalize}
          spellCheck={spellCheck}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      )}{" "}
      {hint ? <small id={hintId}>{hint}</small> : null}
      {error ? (
        <small id={errorId} className={formStyles.fieldError}>
          {error}
        </small>
      ) : null}
    </label>
  );
}

export function MassFields({
  masses,
  onChange,
  template = false,
  path
}: {
  masses: Mass[];
  onChange: (value: Mass[]) => void;
  template?: boolean;
  path?: string;
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
        <div
          className={formStyles.mass}
          key={index}
          role="group"
          aria-label={`Svätá omša ${index + 1}`}
        >
          <div className={formStyles.massMain}>
            <Field
              label="Čas"
              type="time"
              value={mass.time}
              onChange={(value) => update(index, "time", value)}
              path={path ? `${path}.${index}.time` : undefined}
            />
            <Field
              label="Označenie"
              value={getMassLabel(mass)}
              onChange={(value) => update(index, "label", value)}
              path={path ? `${path}.${index}.label` : undefined}
            />
          </div>
          {!template ? (
            <div className={formStyles.massDetails}>
              <Field
                label="Celebrant"
                value={mass.celebrant}
                onChange={(value) => update(index, "celebrant", value)}
                path={path ? `${path}.${index}.celebrant` : undefined}
              />
              <Field
                label="Úmysel"
                value={mass.intention}
                onChange={(value) => update(index, "intention", value)}
                path={path ? `${path}.${index}.intention` : undefined}
                multiline
              />
            </div>
          ) : null}
          <div className={formStyles.rowActions}>
            {index > 0 ? (
              <button
                type="button"
                className={styles.quietLink}
                aria-label={`Posunúť svätú omšu ${index + 1} vyššie`}
                onClick={() => {
                  const items = [...masses];
                  [items[index - 1], items[index]] = [
                    items[index],
                    items[index - 1]
                  ];
                  onChange(items);
                }}
              >
                ↑ Posunúť
              </button>
            ) : null}
            <button
              type="button"
              className={styles.remove}
              aria-label={`Odobrať svätú omšu ${index + 1}`}
              onClick={() => onChange(masses.filter((_, i) => i !== index))}
            >
              Odobrať
            </button>
          </div>
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
