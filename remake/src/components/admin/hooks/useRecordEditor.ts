import { useRef, useState } from "react";
import type { ContentRecord } from "@/content/documents";
import { useUnsavedChanges } from "./useUnsavedChanges";
import { publicationMessage } from "../record-state";

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

const mutationMessages = {
  save: "Uložené. Obsah zostáva súkromný.",
  unpublish: "Obsah je súkromný."
};

/** Own the draft and optimistic version together; a failed write keeps both intact. */
export function useRecordEditor(initialRecord: ContentRecord) {
  const [record, setRecord] = useState(initialRecord);
  const [saved, setSaved] = useState(JSON.stringify(initialRecord.draft));
  const [operation, setOperation] = useState<RecordEditorOperation>("idle");
  const operationRef = useRef<RecordEditorOperation>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState("");
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
    if (!beginOperation(mutationOperations[action])) return null;

    setError("");
    setErrorField("");
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
          ...(action === "save" ? { document: record.draft } : {})
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorField(typeof data.field === "string" ? data.field : "");
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
        // Turning visibility off preserves unsaved local edits.
        setRecord((current) => ({
          ...current,
          published: null,
          version: savedRecord.version,
          publishedAt: savedRecord.publishedAt,
          updatedAt: savedRecord.updatedAt
        }));
      } else {
        setRecord(savedRecord);
      }
      setSaved(JSON.stringify(savedRecord.draft));
      setMessage(
        savedRecord.kind === "settings"
          ? publicationMessage(savedRecord)
          : action === "unpublish"
          ? mutationMessages.unpublish
          : savedRecord.published
          ? `${action === "save" ? "Uložené. " : ""}${publicationMessage(
              savedRecord
            )}`
          : mutationMessages.save
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

    setError("");
    setErrorField("");
    setMessage("");

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
      setErrorField("");
      setMessage("Aktuálna verzia je načítaná.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Načítanie zlyhalo.");
    } finally {
      finishOperation();
    }
  }

  return {
    record,
    setRecord: (next: ContentRecord) => {
      setRecord(next);
      if (!conflict) setError("");
      setErrorField("");
    },
    operation,
    busy,
    dirty,
    error,
    errorField,
    message,
    conflict,
    cacheWarning,
    saveRecord: () => mutate("save"),
    setPublished: (published: boolean) => {
      if (record.kind === "settings" || published === !!record.published)
        return;
      // Enabling visibility must never silently save the local form.
      if (published && dirty) return;
      return mutate(published ? "publish" : "unpublish");
    },
    retryCacheRefresh,
    reloadLatest
  };
}
