"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminRecordSummary } from "@/content/documents";
import {
  isPostKind,
  postKinds,
  postKindLabels,
  type AdminListSection,
  type PostKind
} from "@/content/posts";
import { PostBadge } from "@/components/editorial/PostBadge";
import styles from "./Admin.module.css";

export function RecordList({ section }: { section: AdminListSection }) {
  const router = useRouter();
  const kind = section;
  const [postFilter, setPostFilter] = useState<PostKind | "all">("all");
  const [newPostKind, setNewPostKind] = useState<PostKind>("news");
  const listKind = kind === "posts" && postFilter !== "all" ? postFilter : kind;
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdminRecordSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const requestVersion = useRef(0);

  useEffect(() => {
    const version = ++requestVersion.current;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setItems([]);
    setCursor(null);
    const params = new URLSearchParams({ kind: listKind, query: search });
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
  }, [listKind, search, reload]);

  async function more() {
    if (!cursor || loading) return;
    const version = requestVersion.current;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        kind: listKind,
        query: search,
        cursor
      });
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
          kind: kind === "posts" ? newPostKind : kind
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
          <h1>
            {kind === "bulletin"
              ? "Archív oznamov"
              : kind === "posts"
              ? "Príspevky"
              : "Články"}
          </h1>
        </div>
        <div className={styles.actions}>
          {kind === "posts" ? (
            <select
              aria-label="Typ nového príspevku"
              className={styles.compactInput}
              value={newPostKind}
              disabled={creating}
              onChange={(event) => {
                if (isPostKind(event.target.value))
                  setNewPostKind(event.target.value);
              }}
            >
              {postKinds.map((value) => (
                <option key={value} value={value}>
                  {postKindLabels[value]}
                </option>
              ))}
            </select>
          ) : null}
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
          setSearch(query);
        }}
      >
        {kind === "posts" ? (
          <select
            aria-label="Filtrovať príspevky podľa typu"
            value={postFilter}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "all" || isPostKind(value)) setPostFilter(value);
            }}
          >
            <option value="all">Všetky typy príspevkov</option>
            {postKinds.map((value) => (
              <option key={value} value={value}>
                {postKindLabels[value]}
              </option>
            ))}
          </select>
        ) : null}
        <input
          aria-label="Hľadať obsah"
          placeholder={
            kind === "bulletin"
              ? "Hľadať týždeň, napr. 2026-11-02…"
              : "Hľadať názov…"
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
                Upravené{" "}
                {new Intl.DateTimeFormat("sk-SK", {
                  dateStyle: "medium",
                  timeZone: "Europe/Bratislava"
                }).format(new Date(item.updatedAt))}
              </small>
            </div>
            <div className={styles.recordMeta}>
              {isPostKind(item.kind) ? <PostBadge kind={item.kind} /> : null}
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
