import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentRecord } from "@/content/documents";
import { useUnsavedChanges } from "./useUnsavedChanges";

export type RecordEditorOperation =
  | "idle"
  | "saving"
  | "publishing"
  | "unpublishing"
  | "reloading"
  | "refreshing";

type RecordMutation = "save" | "publish" | "unpublish";

const mutationOperations = {
  save: "saving",
  publish: "publishing",
  unpublish: "unpublishing"
} as const;

const mutationMessages: Record<RecordMutation, string> = {
  save: "Koncept je uložený. Verejná verzia sa nezmenila.",
  publish: "Zverejnené. Verejný web používa túto verziu.",
  unpublish: "Stiahnuté z webu. Koncept ostáva zachovaný."
};

/** Own the draft and optimistic version together; a failed write keeps both intact. */
export function useRecordEditor(initialRecord: ContentRecord) {
  const router = useRouter();
  const [record, setRecord] = useState(initialRecord);
  const [saved, setSaved] = useState(JSON.stringify(initialRecord.draft));
  const [operation, setOperation] = useState<RecordEditorOperation>("idle");
  const operationRef = useRef<RecordEditorOperation>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [cacheWarning, setCacheWarning] = useState("");

  const dirty = JSON.stringify(record.draft) !== saved && !record.readOnly;
  const busy = operation !== "idle";
  useUnsavedChanges(dirty);

  function beginOperation(next: RecordEditorOperation) {
    if (operationRef.current !== "idle") return false;

    operationRef.current = next;
    setOperation(next);
    return true;
  }

  function finishOperation() {
    operationRef.current = "idle";
    setOperation("idle");
  }

  async function mutate(action: RecordMutation): Promise<ContentRecord | null> {
    if (record.readOnly || operationRef.current !== "idle") return null;
    if (
      action === "unpublish" &&
      !window.confirm(
        "Stiahnuť zverejnenú verziu z webu? Koncept a história zostanú zachované."
      )
    )
      return null;
    if (!beginOperation(mutationOperations[action])) return null;

    setError("");
    setMessage("");
    setConflict(false);

    try {
      const endpoint = `/api/admin/records/${encodeURIComponent(record.id)}${
        action === "save" ? "" : `/${action}`
      }`;
      const response = await fetch(endpoint, {
        method: action === "save" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: record.version,
          ...(action !== "unpublish" ? { document: record.draft } : {})
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409 && data.code === "VERSION_CONFLICT")
          setConflict(true);
        throw new Error(
          data.error ||
            (response.status === 401 || response.status === 403
              ? "Prihlásenie vypršalo alebo nemáte prístup. Vaše zmeny ostávajú vo formulári."
              : "Zápis sa nepodaril. Skúste znova.")
        );
      }

      const savedRecord = data as ContentRecord;
      setCacheWarning(data.cacheWarning ?? "");
      if (action === "unpublish") {
        // Removing the public snapshot must not discard an unsaved local draft.
        setRecord((current) => ({
          ...current,
          published: null,
          version: savedRecord.version,
          publishedAt: savedRecord.publishedAt,
          updatedAt: savedRecord.updatedAt
        }));
      } else {
        setRecord(savedRecord);
        setSaved(JSON.stringify(savedRecord.draft));
      }
      setMessage(
        record.kind === "settings" && action === "publish"
          ? "Nastavenia sú uložené."
          : mutationMessages[action]
      );
      return savedRecord;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Uloženie zlyhalo.");
      return null;
    } finally {
      finishOperation();
    }
  }

  async function retryCacheRefresh() {
    if (!beginOperation("refreshing")) return;

    try {
      const response = await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ||
            "Obnovenie webu sa nepodarilo. Zverejnený obsah ostal uložený."
        );

      setCacheWarning("");
      setMessage("Verejný web je obnovený. Obsah sa znovu nezverejňoval.");
    } catch (error) {
      setCacheWarning(
        error instanceof Error
          ? error.message
          : "Obnovenie webu zlyhalo. Skúste znova."
      );
    } finally {
      finishOperation();
    }
  }

  async function reloadLatest() {
    if (
      dirty &&
      !window.confirm(
        "Načítať aktuálnu verziu zo servera? Neuložené zmeny v tomto formulári sa zahodia."
      )
    )
      return;
    if (!beginOperation("reloading")) return;

    try {
      const response = await fetch(
        `/api/admin/records/${encodeURIComponent(record.id)}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Načítanie zlyhalo.");

      const latest = data as ContentRecord;
      setRecord(latest);
      setSaved(JSON.stringify(latest.draft));
      setConflict(false);
      setError("");
      setMessage("Aktuálna verzia je načítaná.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Načítanie zlyhalo.");
    } finally {
      finishOperation();
    }
  }

  async function preview() {
    if (operationRef.current !== "idle") return;

    const savedRecord = dirty ? await mutate("save") : record;
    if (savedRecord)
      router.push(`/admin/preview/${encodeURIComponent(record.id)}`);
  }

  return {
    record,
    setRecord,
    operation,
    busy,
    dirty,
    error,
    message,
    conflict,
    cacheWarning,
    saveRecord: () => mutate("save"),
    publishRecord: () => mutate("publish"),
    unpublishRecord: () => mutate("unpublish"),
    retryCacheRefresh,
    reloadLatest,
    preview
  };
}
