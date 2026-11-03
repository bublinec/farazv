"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MediaAsset } from "@/content/types";
import { containDialogFocus } from "@/lib/dialog";
import { MediaImage } from "./MediaImage";
import { Icon } from "./Icon";

/** Shared modal behavior only. Each gallery retains its own paging and controls. */
export function ImageDialog({
  open,
  onClose,
  onMove,
  className,
  label,
  labelledBy,
  children
}: {
  open: boolean;
  onClose: () => void;
  onMove?: (offset: -1 | 1) => void;
  className: string;
  label?: string;
  labelledBy?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) {
      if (element.open) element.close();
      return;
    }

    // Native dialogs make the background inert and restore the opening control.
    if (!element.open) element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={className}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onCancel={onClose}
      onKeyDown={(event) => {
        containDialogFocus(event);
        if (onMove && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          onMove(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

export function ImageLightbox({
  image,
  children,
  label
}: {
  image: MediaAsset;
  children: ReactNode;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="imageTrigger"
        onClick={() => setOpen(true)}
      >
        <span className="srOnly">{label ?? "Zväčšiť obrázok:"} </span>
        {children}
      </button>
      <ImageDialog
        open={open}
        onClose={() => setOpen(false)}
        className="imageDialog"
        label={image.alt || image.caption || "Zobrazenie obrázka"}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="imageDialogClose"
          aria-label="Zavrieť obrázok"
        >
          <Icon name="close" size={24} />
        </button>
        {open ? (
          <figure>
            <MediaImage image={image} priority fit="contain" sizes="95vw" />
            <figcaption>{image.caption ?? image.alt}</figcaption>
          </figure>
        ) : null}
      </ImageDialog>
    </>
  );
}
