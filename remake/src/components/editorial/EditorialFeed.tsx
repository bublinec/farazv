"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorialKind, EditorialPage } from "@/lib/editorial";
import { EditorialGrid } from "./EditorialCard";
import styles from "./EditorialFeed.module.css";

export function EditorialFeed({
  initialPage,
  kind
}: {
  initialPage: EditorialPage;
  kind: EditorialKind;
}) {
  const [items, setItems] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const feed = useRef<HTMLDivElement>(null);
  const focusIndex = useRef<number | null>(null);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (focusIndex.current !== null) {
      feed.current
        ?.querySelectorAll<HTMLAnchorElement>("article > a")
        [focusIndex.current]?.focus();
      focusIndex.current = null;
    }
  }, [items]);

  async function loadMore() {
    if (!nextCursor || pending.current) return;
    pending.current = true;
    setLoading(true);
    setError(false);
    controller.current = new AbortController();
    try {
      const query = new URLSearchParams({ cursor: nextCursor });
      const response = await fetch(
        `/api/${kind === "article" ? "articles" : "news"}?${query}`,
        {
          signal: controller.current.signal
        }
      );
      if (!response.ok) throw new Error("Could not load editorial page");
      const page: EditorialPage = await response.json();
      if (
        !Array.isArray(page.items) ||
        !(page.nextCursor === null || typeof page.nextCursor === "string")
      ) {
        throw new Error("Unexpected editorial response");
      }
      const knownIds = new Set(items.map((entry) => entry.id));
      const added = page.items.filter((entry) => {
        if (knownIds.has(entry.id)) return false;
        knownIds.add(entry.id);
        return true;
      });
      if (added.length) focusIndex.current = items.length;
      setItems((existing) => [...existing, ...added]);
      setNextCursor(page.nextCursor);
      setAnnouncement(`Načítané ďalšie príspevky: ${page.items.length}.`);
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === "AbortError"))
        setError(true);
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  return (
    <div ref={feed}>
      {items.length ? (
        <EditorialGrid entries={items} kind={kind} />
      ) : (
        <p className={styles.empty}>Zatiaľ tu nie sú žiadne príspevky.</p>
      )}
      <div className={styles.pagination}>
        <p className={styles.count}>
          {kind === "article" ? "Zobrazené články" : "Zobrazené príspevky"}:{" "}
          {items.length}
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            Ďalšie príspevky sa nepodarilo načítať. Skúste to znova.
          </p>
        )}
        {nextCursor ? (
          <button
            type="button"
            className="buttonOutline"
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Načítavam…" : error ? "Skúsiť znova" : "Načítať ďalšie"}
            {!loading && <span aria-hidden="true">↓</span>}
          </button>
        ) : items.length > 0 ? (
          <p className={styles.end}>
            Ste na konci. Ďakujeme, že čítate s nami.
          </p>
        ) : null}
        <span role="status" className={styles.srOnly}>
          {announcement}
        </span>
      </div>
    </div>
  );
}
