"use client";

import { useEffect, useRef, useState } from "react";
import {
  feedbackLimits,
  feedbackTopics,
  type FeedbackTopic
} from "@/content/feedback";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import { Icon } from "@/components/ui/Icon";
import styles from "./Feedback.module.css";

type FormError = { message: string; field?: string; technical?: boolean };

function FeedbackField({
  name,
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = false,
  required = false,
  minimum,
  type = "text",
  error
}: {
  name: keyof typeof feedbackLimits;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  required?: boolean;
  minimum?: number;
  type?: string;
  error: FormError | null;
}) {
  const invalid = error?.field === name;
  const props = {
    id: `feedback-${name}`,
    name,
    value,
    required,
    placeholder,
    minLength: minimum,
    maxLength: feedbackLimits[name],
    "aria-invalid": invalid,
    "aria-describedby":
      [hint ? `hint-${name}` : "", invalid ? `error-${name}` : ""]
        .filter(Boolean)
        .join(" ") || undefined,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange(event.target.value)
  };

  return (
    <div className={styles.field}>
      <label htmlFor={props.id}>
        {label}
        {!required ? <span> (nepovinné)</span> : null}
      </label>
      {hint ? (
        <p id={`hint-${name}`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {multiline ? (
        <textarea {...props} rows={4} />
      ) : (
        <input
          {...props}
          type={type}
          autoComplete={type === "email" ? "email" : "off"}
        />
      )}
      {invalid ? (
        <p id={`error-${name}`} className={styles.fieldError} role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}

export function FeedbackForm({
  initialTopic
}: {
  initialTopic?: FeedbackTopic;
}) {
  const [topic, setTopic] = useState<FeedbackTopic | "">(initialTopic ?? "");
  const [values, setValues] = useState({
    subject: "",
    problem: "",
    proposal: "",
    benefit: "",
    pageUrl: "",
    message: "",
    email: "",
    company: ""
  });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const sending = useRef(false);
  const lastAttempt = useRef<{ text: string; id: string } | null>(null);
  const success = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) success.current?.focus();
    if (error?.field) {
      form.current
        ?.querySelector<HTMLElement>(`[name="${CSS.escape(error.field)}"]`)
        ?.focus();
    }
  }, [error, sent]);

  function update(name: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    if (error?.field === name) setError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    if (!topic) {
      setError({
        message: "Vyberte, čoho sa váš podnet týka.",
        field: "topic"
      });
      return;
    }
    const body = {
      topic,
      subject: values.subject.trim(),
      email: values.email.trim(),
      company: values.company,
      ...(topic === "website"
        ? {
            problem: values.problem.trim(),
            proposal: values.proposal.trim(),
            benefit: values.benefit.trim(),
            pageUrl: values.pageUrl.trim()
          }
        : { message: values.message.trim() })
    };
    sending.current = true;
    setBusy(true);
    setError(null);

    try {
      const text = JSON.stringify(body);
      if (lastAttempt.current?.text !== text)
        lastAttempt.current = { text, id: crypto.randomUUID() };
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, id: lastAttempt.current.id })
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Služba neodpovedá správne. Váš text zostal vo formulári."
        );
      }
      if (!response.ok) {
        setError({
          message:
            typeof data?.error === "string"
              ? data.error
              : "Podnet sa nepodarilo odoslať. Skúste znova.",
          field: typeof data?.field === "string" ? data.field : undefined,
          technical: response.status >= 500 || data?.code === "INVALID_ORIGIN"
        });
        return;
      }
      if (data?.ok !== true)
        throw new Error("Odoslanie sa nepodarilo potvrdiť. Skúste znova.");
      setSent(true);
      setValues({
        subject: "",
        problem: "",
        proposal: "",
        benefit: "",
        pageUrl: "",
        message: "",
        email: "",
        company: ""
      });
      lastAttempt.current = null;
    } catch (cause) {
      setError({
        message:
          cause instanceof Error
            ? cause.message
            : "Podnet sa nepodarilo odoslať. Váš text zostal vo formulári.",
        technical: true
      });
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  if (sent)
    return (
      <div className={styles.success} ref={success} tabIndex={-1} role="status">
        <Icon name="check" size={30} />
        <h2>Ďakujeme za váš podnet.</h2>
        <p>
          Váš podnet sme prijali. Pomáhate nám zlepšovať život farnosti aj tento
          web.
        </p>
        <button type="button" className="button" onClick={() => setSent(false)}>
          Poslať ďalší podnet
        </button>
      </div>
    );

  const field = (
    name: keyof typeof feedbackLimits,
    label: string,
    options: {
      placeholder?: string;
      hint?: string;
      multiline?: boolean;
      required?: boolean;
      minimum?: number;
      type?: string;
    } = {}
  ) => (
    <FeedbackField
      name={name}
      label={label}
      value={values[name]}
      onChange={(value) => update(name, value)}
      error={error}
      {...options}
    />
  );

  return (
    <form ref={form} onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy} className={styles.fields}>
        <fieldset className={styles.topics}>
          <legend>Čoho sa váš podnet týka?</legend>
          <div>
            {Object.entries(feedbackTopics).map(([key, label]) => (
              <label key={key}>
                <input
                  type="radio"
                  name="topic"
                  value={key}
                  checked={topic === key}
                  required
                  onChange={() => {
                    setTopic(key as FeedbackTopic);
                    setError(null);
                  }}
                  aria-describedby={
                    error?.field === "topic" ? "error-topic" : undefined
                  }
                />
                {label}
              </label>
            ))}
          </div>
          {error?.field === "topic" ? (
            <p id="error-topic" className={styles.fieldError} role="alert">
              {error.message}
            </p>
          ) : null}
        </fieldset>

        {topic === "website" ? (
          <p className={styles.guidance}>
            Aby sme mohli návrh posúdiť, potrebujeme podrobnejší opis: čo vám
            chýba, ako by mala funkcia fungovať a komu by pomohla. Samotný názov
            funkcie nestačí.
          </p>
        ) : null}
        {field("subject", "Názov podnetu", {
          required: true,
          minimum: 3,
          placeholder:
            topic === "website"
              ? "Napríklad: Pridanie svätej omše do kalendára"
              : "Stručne pomenujte svoj podnet"
        })}
        {topic === "website" ? (
          <>
            {field("problem", "Čo vám na webe chýba alebo nefunguje?", {
              required: true,
              minimum: 30,
              multiline: true,
              placeholder:
                "Napríklad: Keď si na mobile pozerám rozpis omší, chcel by som si vybranú omšu jednoducho uložiť do kalendára."
            })}
            {field("proposal", "Ako by to malo fungovať?", {
              required: true,
              minimum: 30,
              multiline: true,
              placeholder:
                "Pri každej omši by mohlo byť tlačidlo Pridať do kalendára. Po kliknutí by sa uložil dátum, čas a miesto omše.",
              hint: "Opíšte konkrétny postup alebo príklad. Pri chybe napíšte, čo ste urobili, čo sa stalo a čo ste očakávali."
            })}
            {field("benefit", "Komu by to pomohlo?", {
              multiline: true,
              placeholder:
                "Napríklad: Ľuďom, ktorí používajú pripomienky v telefóne."
            })}
            {field("pageUrl", "Odkaz na konkrétnu stránku", {
              placeholder: "https://farazv.sk/… alebo /kontakt"
            })}
          </>
        ) : topic === "parish" ? (
          field("message", "Váš podnet", {
            required: true,
            minimum: 20,
            multiline: true,
            placeholder:
              "Opíšte svoj nápad alebo spätnú väzbu. Čo by ste chceli zlepšiť, komu by to pomohlo a ako by to mohlo fungovať?"
          })
        ) : null}
        {field("email", "E-mail", {
          type: "email",
          placeholder: "vas@email.sk",
          hint: "Ak chcete, aby sme vás mohli kontaktovať s doplňujúcou otázkou alebo odpoveďou."
        })}
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Firma
            <input
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={values.company}
              onChange={(event) => update("company", event.target.value)}
            />
          </label>
        </div>
        <p className={styles.privacy}>
          Podnet uvidia iba správcovia webu. E-mail použijeme iba na prípadnú
          odpoveď alebo doplňujúce otázky. Správu uchovávame, kým ju správca
          neodstráni.
        </p>
        {error && !error.field ? (
          <div className={styles.error} role="alert">
            {error.message}
            {error.technical ? <TechnicalSupport /> : null}
          </div>
        ) : null}
        <button className="button" type="submit" disabled={busy}>
          {busy ? "Odosielam…" : "Odoslať podnet"}
        </button>
      </fieldset>
    </form>
  );
}
