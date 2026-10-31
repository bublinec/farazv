import { useRef, useState } from "react";
import type { MediaAsset } from "@/content/types";
import { readAdminJson } from "../admin-api";

type ImageUploadOperation = "idle" | "signing" | "uploading" | "completing";

interface PendingImageUpload {
  ticket: string;
  response: unknown;
  defaultAlt: string;
}

interface ImageDescription {
  alt: string;
  caption: string;
}

/** Once the provider accepts the bytes, retries only confirm that same asset. */
export function useImageUpload(onComplete: (asset: MediaAsset) => void) {
  const [operation, setOperation] = useState<ImageUploadOperation>("idle");
  const operationRef = useRef<ImageUploadOperation>("idle");
  const [pending, setPending] = useState<PendingImageUpload | null>(null);
  const [error, setError] = useState("");

  function changeOperation(next: ImageUploadOperation) {
    operationRef.current = next;
    setOperation(next);
  }

  async function completeUpload(
    pendingUpload: PendingImageUpload,
    description: ImageDescription
  ) {
    changeOperation("completing");
    const complete = await readAdminJson(
      await fetch("/api/admin/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket: pendingUpload.ticket,
          response: pendingUpload.response,
          alt: description.alt || pendingUpload.defaultAlt,
          caption: description.caption
        })
      })
    );

    onComplete(complete.asset);
    setPending(null);
  }

  async function retryCompletion(description: ImageDescription) {
    if (!pending || operationRef.current !== "idle") return;
    setError("");

    try {
      await completeUpload(pending, description);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Potvrdenie nahratého obrázka zlyhalo. Skúste znova."
      );
    } finally {
      changeOperation("idle");
    }
  }

  async function uploadImage(file: File, description: ImageDescription) {
    if (pending || operationRef.current !== "idle") return;
    changeOperation("signing");
    setError("");

    try {
      const signed = await readAdminJson(
        await fetch("/api/admin/uploads/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            size: file.size
          })
        })
      );
      if (file.size > signed.maxBytes) {
        throw new Error(
          `Obrázok je príliš veľký. Limit je ${Math.floor(
            signed.maxBytes / 1024 / 1024
          )} MB.`
        );
      }

      const form = new FormData();
      for (const [key, value] of Object.entries(signed.fields))
        form.append(key, String(value));
      form.append("file", file);
      changeOperation("uploading");
      const response = await readAdminJson(
        await fetch(signed.uploadUrl, { method: "POST", body: form })
      );
      const uploaded = {
        ticket: signed.ticket,
        response,
        defaultAlt: file.name.replace(/\.[^.]+$/, "")
      };
      setPending(uploaded);

      await completeUpload(uploaded, description);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Nahrávanie zlyhalo. Obrázok môžete skúsiť nahrať znova."
      );
    } finally {
      changeOperation("idle");
    }
  }

  return {
    operation,
    busy: operation !== "idle",
    pending,
    error,
    clearError: () => setError(""),
    discardPending: () => setPending(null),
    uploadImage,
    retryCompletion
  };
}
