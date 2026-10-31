"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminRecordSummary, RecordKind } from "@/content/documents";
import { recordKindNames } from "@/content/record-labels";
import { getLocalDate, getMonday } from "@/lib/calendar";
import styles from "./Admin.module.css";

const kinds: RecordKind[] = [
  "bulletin",
  "news",
  "article",
  "notice",
  "event",
  "settings"
];

export function RecordList() {
  const router = useRouter();
  const [kind, setKind] = useState<RecordKind>("bulletin");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdminRecordSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [weekStart, setWeekStart] = useState(getMonday(getLocalDate()));
  const [reload, setReload] = useState(0);
  const requestVersion = useRef(0);

  useEffect(() => {
    const version = ++requestVersion.current;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setItems([]);
    setCursor(null);
    const params = new URLSearchParams({ kind, query: search });
    fetch(`/api/admin/records?${params}`, {
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => {
        const data = await response.json();
        if (controller.signal.aborted || version !== requestVersion.current)
          return;
        if (!response.ok)
          throw new Error(data.error || "Obsah sa nepodarilo načítať.");
        setItems(data.items);
        setCursor(data.nextCursor ?? null);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      controller.abort();
      requestVersion.current++;
    };
  }, [kind, search, reload]);

  async function more() {
    if (!cursor || loading) return;
    const version = requestVersion.current;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ kind, query: search, cursor });
      const response = await fetch(`/api/admin/records?${params}`, {
        cache: "no-store"
      });
      const data = await response.json();
      if (version !== requestVersion.current) return;
      if (!response.ok)
        throw new Error(data.error || "Obsah sa nepodarilo načítať.");
      setItems((old) => [
        ...old,
        ...data.items.filter(
          (item: AdminRecordSummary) =>
            !old.some((previous) => previous.id === item.id)
        )
      ]);
      setCursor(data.nextCursor ?? null);
    } catch (error) {
      if (version === requestVersion.current)
        setError(error instanceof Error ? error.message : "Načítanie zlyhalo.");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }

  async function create() {
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          ...(kind === "bulletin" ? { weekStart } : {})
        })
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Koncept sa nepodarilo vytvoriť.");
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
          <h1>Redakcia farnosti</h1>
          <p>
            Pripravte oznamy, články a obrázky. Uloženie konceptu nemení verejný
            web; až zverejnenie sprístupní novú verziu.
          </p>
        </div>
      </div>
      <nav className={styles.tabs} aria-label="Druhy obsahu">
        {kinds.map((value) => (
          <button
            key={value}
            className={styles.tab}
            type="button"
            aria-pressed={kind === value}
            disabled={creating}
            onClick={() => {
              setKind(value);
              setSearch("");
              setQuery("");
            }}
          >
            {recordKindNames[value]}
          </button>
        ))}
      </nav>
      <div className={styles.newRow}>
        {kind === "bulletin" ? (
          <label className={styles.field}>
            Pondelok nového týždňa
            <input
              type="date"
              value={weekStart}
              onChange={(event) =>
                setWeekStart(event.target.value as typeof weekStart)
              }
            />
            <small>
              Nový rozpis sa predvyplní overenou pravidelnou šablónou.
            </small>
          </label>
        ) : (
          <p className={styles.hint}>
            {kind === "settings"
              ? "Kontakty, úradné hodiny, Náuky, dary a pravidelné omše."
              : "Nový záznam začne ako súkromný koncept."}
          </p>
        )}
        <button
          className={styles.button}
          type="button"
          disabled={creating}
          onClick={() => void create()}
        >
          {creating
            ? "Vytváram…"
            : kind === "settings"
            ? "Otvoriť nastavenia"
            : kind === "bulletin"
            ? "+ Vytvoriť týždeň"
            : "+ Nový záznam"}
        </button>
      </div>
      {kind === "bulletin" ? (
        <p className={styles.hint}>
          Historické importované oznamy sú dostupné iba tu. Problematické
          záznamy sa zobrazujú na čítanie so zachovanými dátumami a poznámkami.
        </p>
      ) : null}
      <form
        className={styles.search}
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query);
        }}
      >
        <input
          aria-label="Hľadať obsah"
          placeholder={
            kind === "bulletin"
              ? "Hľadať týždeň, napr. 2026-11-02…"
              : "Hľadať názov alebo adresu…"
          }
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className={styles.secondary} disabled={loading}>
          Hľadať
        </button>
      </form>
      {error ? (
        <div className={styles.error} role="alert">
          {error}{" "}
          <button
            className={styles.secondary}
            type="button"
            onClick={() => setReload((value) => value + 1)}
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
            className={styles.record}
          >
            <div>
              <strong>{item.title || "Koncept bez názvu"}</strong>
              <small>
                {item.weekStart ? `Týždeň od ${item.weekStart} · ` : ""}
                {item.slug ? `/${item.slug} · ` : ""}Upravené{" "}
                {new Intl.DateTimeFormat("sk-SK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Europe/Bratislava"
                }).format(new Date(item.updatedAt))}
              </small>
            </div>
            <div className={styles.recordMeta}>
              <span
                className={`${styles.badge} ${
                  item.isPublished ? styles.published : ""
                }`}
              >
                {item.isPublished ? "Zverejnené" : "Koncept"}
              </span>
              {item.readOnly ? (
                <span className={styles.badge}>História · iba čítanie</span>
              ) : null}
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
          Žiadny záznam. Vytvorte nový koncept alebo upravte hľadanie.
        </div>
      ) : null}
      {cursor ? (
        <button
          className={styles.secondary}
          type="button"
          disabled={loading}
          onClick={() => void more()}
          style={{ marginTop: "1rem" }}
        >
          Načítať ďalšie
        </button>
      ) : null}
    </>
  );
}
