"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TechnicalSupport } from "@/components/ui/TechnicalSupport";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import type { AdminListSection } from "@/content/posts";
import styles from "./Admin.module.css";
import formStyles from "./AdminForms.module.css";
import { useRecordList } from "./hooks/useRecordList";
import { summaryStateLabel } from "./record-state";

export function RecordList({ section }: { section: AdminListSection }) {
  return <RecordListContents key={section} section={section} />;
}

function RecordListContents({ section }: { section: AdminListSection }) {
  const router = useRouter();
  const kind = section;
  const list = useRecordList(section);
  const { query, setQuery, items, cursor, loading, error, setError } = list;
  const [creating, setCreating] = useState(false);

  async function create() {
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: kind === "posts" ? "news" : kind
        })
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Koncept sa nepodarilo vytvoriť.");
      list.remember();
      router.push(`/admin/records/${encodeURIComponent(data.id)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Vytvorenie zlyhalo.");
      setCreating(false);
    }
  }

  return (
    <>
      <div className={styles.heading}>
        <div>
          <h1>
            {kind === "bulletin"
              ? "Archív oznamov"
              : kind === "posts"
              ? "Výveska"
              : "Naše spoločenstvo"}
          </h1>
        </div>
        <div className={styles.actions}>
          {kind === "bulletin" ? (
            <Link href="/admin" className={styles.secondary}>
              ← Nahrať oznamy
            </Link>
          ) : (
            <button
              className={styles.button}
              type="button"
              disabled={creating}
              onClick={() => void create()}
            >
              {creating
                ? "Vytváram…"
                : kind === "posts"
                ? "+ Nový príspevok"
                : "+ Nový článok"}
            </button>
          )}
        </div>
      </div>
      <form
        className={styles.search}
        onSubmit={(event) => {
          event.preventDefault();
          list.searchForQuery();
        }}
      >
        <input
          aria-label="Hľadať obsah"
          placeholder={
            kind === "bulletin"
              ? "Hľadať týždeň, napr. 2026-11-02…"
              : "Hľadať názov…"
          }
          value={query}
          maxLength={150}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className={styles.secondary} disabled={loading}>
          Hľadať
        </button>
        <div
          className={formStyles.filters}
          role="group"
          aria-label="Stav obsahu"
        >
          <button
            type="button"
            aria-pressed={list.filter === "all"}
            onClick={() => list.setFilter("all")}
          >
            Všetky
          </button>
          <button
            type="button"
            aria-pressed={list.filter === "draft"}
            onClick={() => list.setFilter("draft")}
          >
            Koncepty
          </button>
        </div>
      </form>
      {error ? (
        <div className={styles.error} role="alert">
          {error}
          <TechnicalSupport />
          <button
            className={styles.secondary}
            type="button"
            onClick={list.retry}
          >
            Skúsiť znova
          </button>
        </div>
      ) : null}
      <div className={styles.recordList}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/admin/records/${encodeURIComponent(item.id)}`}
            className={`${styles.record} ${
              kind !== "bulletin" ? styles.editorialRecord : ""
            }`}
            onClick={list.remember}
          >
            <div className={styles.recordContent}>
              {kind !== "bulletin" ? (
                <div className={styles.recordThumbnail} aria-hidden="true">
                  {item.cover ? (
                    <MediaImage
                      image={{ ...item.cover, alt: "" }}
                      sizes="72px"
                    />
                  ) : (
                    <Icon name="image" size={21} />
                  )}
                </div>
              ) : null}
              <div className={styles.recordCopy}>
                <strong>{item.title || "Koncept bez názvu"}</strong>
                <small>
                  {item.weekStart ? `Týždeň od ${item.weekStart} · ` : ""}
                  Upravené{" "}
                  {new Intl.DateTimeFormat("sk-SK", {
                    dateStyle: "medium",
                    timeZone: "Europe/Bratislava"
                  }).format(new Date(item.updatedAt))}
                </small>
              </div>
            </div>
            <div className={styles.recordMeta}>
              <span
                className={`${styles.badge} ${
                  item.isPublished &&
                  !item.hasUnpublishedChanges &&
                  !item.readOnly
                    ? styles.published
                    : ""
                }`}
              >
                {summaryStateLabel(item)}
              </span>
            </div>
          </Link>
        ))}
      </div>
      {loading ? (
        <p role="status" className={styles.status}>
          Načítavam obsah…
        </p>
      ) : !items.length && !error ? (
        <div className={styles.empty}>
          {kind === "bulletin"
            ? "Žiadne oznamy. Skúste upraviť hľadanie."
            : list.filter === "draft"
            ? "Žiadne koncepty."
            : "Žiadny záznam. Vytvorte nový alebo upravte hľadanie."}
        </div>
      ) : null}
      {cursor ? (
        <button
          className={styles.secondary}
          type="button"
          disabled={loading}
          onClick={() => void list.more()}
          style={{ marginTop: "1rem" }}
        >
          Načítať ďalšie
        </button>
      ) : null}
    </>
  );
}
