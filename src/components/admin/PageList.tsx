"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import {
  pageGroups,
  pageRoute,
  slugifyPageTitle,
  type PageGroup,
  type PageSummary
} from "@/content/page-documents";
import { Field } from "./Fields";
import { readAdminJson } from "./admin-api";
import { formatAdminTimestamp } from "./admin-format";
import styles from "./Admin.module.css";
import pageStyles from "./PageForm.module.css";

function stateLabel(page: PageSummary) {
  if (!page.recordId) return "Pôvodná verzia z kódu";
  if (page.hasUnpublishedChanges) return "Zverejnené · koncept má ďalšie zmeny";
  if (page.isPublished) return "Zverejnené z administrácie";
  return page.builtIn
    ? "Koncept · na webe je verzia z kódu"
    : "Koncept · nie je na webe";
}

function NewPageForm({
  group,
  onCancel
}: {
  group: PageGroup;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [customSlug, setCustomSlug] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const effectiveSlug = customSlug ? slug : slugifyPageTitle(title);

  async function create() {
    setCreating(true);
    setError("");
    try {
      const record = await readAdminJson(
        await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ group, title, slug: effectiveSlug })
        }),
        "Stránku sa nepodarilo vytvoriť."
      );
      router.push(`/admin/records/${encodeURIComponent(record.id)}`);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Vytvorenie zlyhalo."
      );
      setCreating(false);
    }
  }

  return (
    <form
      className={styles.panel}
      onSubmit={(event) => {
        event.preventDefault();
        if (!creating) void create();
      }}
    >
      <h2>Nová stránka · {pageGroups[group].label}</h2>
      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}
      <div className={styles.fields}>
        <Field
          label="Názov"
          value={title}
          onChange={setTitle}
          maxLength={300}
        />
        <Field
          label="Posledná časť adresy"
          value={effectiveSlug}
          onChange={(value) => {
            setCustomSlug(true);
            setSlug(value);
          }}
          autoCapitalize="none"
          spellCheck={false}
          maxLength={80}
          hint={`Stránka bude na adrese /${pageRoute(
            group,
            effectiveSlug || "…"
          )}. Po vytvorení sa adresa nemení.`}
        />
      </div>
      <p className={styles.hint}>
        Stránka vznikne ako súkromný koncept. Na webe, v menu a na úvodnej
        stránke sa objaví až po zverejnení.
      </p>
      <div className={styles.actions}>
        <button
          className={styles.button}
          type="submit"
          disabled={creating || !title.trim()}
        >
          {creating ? "Vytváram…" : "Vytvoriť koncept"}
        </button>
        <button className={styles.secondary} type="button" onClick={onCancel}>
          Zrušiť
        </button>
      </div>
    </form>
  );
}

/** Sacrament and service pages, including those still shown from code. */
export function PageList() {
  const router = useRouter();
  const [pages, setPages] = useState<PageSummary[] | null>(null);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState("");
  const [adding, setAdding] = useState<PageGroup | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      setPages(
        await readAdminJson(
          await fetch("/api/admin/pages", { cache: "no-store" }),
          "Zoznam stránok sa nepodarilo načítať."
        )
      );
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Načítanie zlyhalo."
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function open(page: PageSummary) {
    if (page.recordId) {
      router.push(`/admin/records/${encodeURIComponent(page.recordId)}`);
      return;
    }

    setOpening(page.route);
    setError("");
    try {
      const record = await readAdminJson(
        await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ route: page.route })
        }),
        "Stránku sa nepodarilo otvoriť."
      );
      router.push(`/admin/records/${encodeURIComponent(record.id)}`);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Otvorenie zlyhalo."
      );
      setOpening("");
    }
  }

  return (
    <>
      <div className={styles.heading}>
        <div>
          <h1>Stránky</h1>
          <p>
            Sviatosti a služby vo farnosti. Kým stránku v administrácii
            nezverejníte, na webe sa zobrazuje jej pôvodná verzia z kódu.
          </p>
        </div>
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          {error}
          <TechnicalSupport />
          <button className={styles.secondary} type="button" onClick={load}>
            Skúsiť znova
          </button>
        </div>
      ) : null}
      {pages === null && !error ? (
        <p role="status">Načítavam stránky…</p>
      ) : null}

      {pages
        ? (Object.keys(pageGroups) as PageGroup[]).map((group) => (
            <section
              className={styles.panel}
              key={group}
              aria-labelledby={`pages-${group}`}
            >
              <div className={pageStyles.groupHeading}>
                <h2 id={`pages-${group}`}>{pageGroups[group].label}</h2>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => setAdding(group)}
                >
                  {group === "sacrament"
                    ? "+ Pridať sviatosť"
                    : "+ Pridať službu"}
                </button>
              </div>
              {adding === group ? (
                <NewPageForm group={group} onCancel={() => setAdding(null)} />
              ) : null}
              <ul className={`${styles.recordList} ${pageStyles.plainList}`}>
                {pages
                  .filter((page) => page.group === group)
                  .map((page) => (
                    <li key={page.route}>
                      <button
                        type="button"
                        className={`${styles.record} ${pageStyles.pageButton}`}
                        disabled={!!opening}
                        onClick={() => void open(page)}
                      >
                        <span className={styles.recordCopy}>
                          <strong>{page.title}</strong>
                          <small>
                            /{page.route} · {stateLabel(page)}
                            {page.updatedAt
                              ? ` · ${formatAdminTimestamp(page.updatedAt)}`
                              : ""}
                          </small>
                        </span>
                        <span className={pageStyles.pageAction}>
                          {opening === page.route
                            ? "Otváram…"
                            : page.recordId
                            ? "Upraviť →"
                            : "Začať upravovať →"}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))
        : null}
    </>
  );
}
