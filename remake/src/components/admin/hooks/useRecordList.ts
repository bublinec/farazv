import { useEffect, useRef, useState } from "react";
import type { AdminRecordSummary } from "@/content/documents";
import type { AdminListSection } from "@/content/posts";
import { readAdminJson } from "../admin-api";

type ListFilter = "all" | "draft";
interface ListPosition {
  version: 1;
  query: string;
  filter: ListFilter;
  pages: number;
  scrollY: number;
}
interface RecordsPage {
  items: AdminRecordSummary[];
  nextCursor: string | null;
}

function listParams(
  section: AdminListSection,
  query: string,
  filter: ListFilter,
  cursor?: string
) {
  return new URLSearchParams({
    kind: section,
    query,
    ...(filter === "draft" ? { status: "draft" } : {}),
    ...(cursor ? { cursor } : {})
  });
}

function storageKey(section: AdminListSection) {
  return `farazv:admin-list:${section}`;
}

function readPosition(section: AdminListSection): ListPosition | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(storageKey(section)) || "null"
    );
    if (
      value?.version !== 1 ||
      typeof value.query !== "string" ||
      value.query.length > 150 ||
      (value.filter !== "all" && value.filter !== "draft") ||
      !Number.isInteger(value.pages) ||
      value.pages < 1 ||
      value.pages > 100 ||
      !Number.isFinite(value.scrollY) ||
      value.scrollY < 0
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

/** Remember list position only; records are fetched again after editing. */
export function useRecordList(section: AdminListSection) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ListFilter>("all");
  const [items, setItems] = useState<AdminRecordSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [reload, setReload] = useState(0);
  const request = useRef<AbortController | null>(null);
  const pageCount = useRef(1);
  const restore = useRef<ListPosition | null>(null);
  const scrollTarget = useRef<number | null>(null);

  useEffect(() => {
    const position = readPosition(section);
    restore.current = position;
    if (position) {
      setQuery(position.query);
      setSearch(position.query);
      setFilter(position.filter);
    }
    setReady(true);
  }, [section]);

  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();
    request.current = controller;
    const remembered = restore.current;
    const position =
      remembered?.query === search && remembered.filter === filter
        ? remembered
        : null;
    restore.current = null;
    const pages = position?.pages ?? 1;
    setLoading(true);
    setError("");
    setItems([]);
    setCursor(null);

    async function load() {
      try {
        let records: AdminRecordSummary[] = [];
        let next: string | null = null;
        let loadedPages = 0;

        do {
          const response = await fetch(
            `/api/admin/records?${listParams(
              section,
              search,
              filter,
              next ?? undefined
            )}`,
            {
              cache: "no-store",
              signal: controller.signal
            }
          );
          const page: RecordsPage = await readAdminJson(response);
          records = records.concat(page.items);
          next = page.nextCursor;
          loadedPages++;
        } while (next && loadedPages < pages && !controller.signal.aborted);

        if (controller.signal.aborted || request.current !== controller) return;
        pageCount.current = loadedPages;
        setItems([
          ...new Map(records.map((record) => [record.id, record])).values()
        ]);
        setCursor(next);
        scrollTarget.current = position?.scrollY ?? null;
      } catch (cause) {
        if (!controller.signal.aborted && request.current === controller) {
          // Retrying a failed return to the list should restore the same pages.
          restore.current = position;
          setError(
            cause instanceof Error
              ? cause.message
              : "Obsah sa nepodarilo načítať."
          );
        }
      } finally {
        if (!controller.signal.aborted && request.current === controller) {
          request.current = null;
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      controller.abort();
      request.current?.abort();
      request.current = null;
    };
  }, [section, search, filter, ready, reload]);

  useEffect(() => {
    if (loading || scrollTarget.current === null) return;
    const target = scrollTarget.current;
    scrollTarget.current = null;
    const frame = requestAnimationFrame(() =>
      window.scrollTo({ top: target, behavior: "instant" })
    );
    return () => cancelAnimationFrame(frame);
  }, [loading, items]);

  async function more() {
    if (!cursor || loading || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/records?${listParams(section, search, filter, cursor)}`,
        {
          cache: "no-store",
          signal: controller.signal
        }
      );
      const page: RecordsPage = await readAdminJson(response);
      if (controller.signal.aborted || request.current !== controller) return;

      setItems((previous) => {
        const ids = new Set(previous.map((item) => item.id));
        return [...previous, ...page.items.filter((item) => !ids.has(item.id))];
      });
      pageCount.current++;
      setCursor(page.nextCursor);
    } catch (cause) {
      if (!controller.signal.aborted && request.current === controller)
        setError(cause instanceof Error ? cause.message : "Načítanie zlyhalo.");
    } finally {
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  }

  function remember() {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        storageKey(section),
        JSON.stringify({
          version: 1,
          query: search,
          filter,
          pages: pageCount.current,
          scrollY: window.scrollY
        } satisfies ListPosition)
      );
    } catch {
      // Storage can be disabled; loading and editing still work normally.
    }
  }

  function searchForQuery() {
    setSearch(query.trim().slice(0, 150));
  }

  return {
    query,
    setQuery,
    filter,
    setFilter,
    items,
    cursor,
    loading,
    error,
    setError,
    more,
    remember,
    searchForQuery,
    retry: () =>
      items.length && cursor ? void more() : setReload((value) => value + 1)
  };
}
