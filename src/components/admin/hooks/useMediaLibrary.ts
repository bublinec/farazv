import { useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/content/types";
import { readAdminJson } from "../admin-api";

type MediaLibraryOperation = "idle" | "loading" | "loading-more";

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [operation, setOperation] = useState<MediaLibraryOperation>("idle");
  const [loaded, setLoaded] = useState(false);
  const requestVersion = useRef(0);
  const loadedQuery = useRef("");

  // A previous search or an unmounted dialog cannot overwrite a newer result.
  useEffect(
    () => () => {
      requestVersion.current++;
    },
    []
  );

  async function load(next?: string) {
    const version = ++requestVersion.current;
    setOperation(next ? "loading-more" : "loading");
    setError("");

    try {
      // A cursor belongs to the displayed results, not unsent search input.
      const searchQuery = next ? loadedQuery.current : query;
      const params = new URLSearchParams({ query: searchQuery });
      if (next) params.set("cursor", next);
      const data = await readAdminJson(
        await fetch(`/api/admin/media?${params}`, { cache: "no-store" })
      );
      if (version !== requestVersion.current) return;

      loadedQuery.current = searchQuery;
      setItems((old) => (next ? [...old, ...data.items] : data.items));
      setCursor(data.nextCursor ?? null);
      setLoaded(true);
    } catch (error) {
      if (version === requestVersion.current) {
        setError(
          error instanceof Error
            ? error.message
            : "Obrázky sa nepodarilo načítať."
        );
      }
    } finally {
      if (version === requestVersion.current) setOperation("idle");
    }
  }

  function addAsset(asset: MediaAsset) {
    setItems((old) => [asset, ...old.filter((item) => item.src !== asset.src)]);
  }

  return {
    items,
    cursor,
    query,
    setQuery,
    loaded,
    error,
    clearError: () => setError(""),
    operation,
    busy: operation !== "idle",
    load,
    addAsset
  };
}
