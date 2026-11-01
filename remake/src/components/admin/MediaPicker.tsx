"use client";

import { TechnicalSupport } from "@/components/ui/TechnicalSupport";

import { useEffect, useId, useRef, useState } from "react";
import type { MediaAsset } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import { useMediaLibrary } from "./hooks/useMediaLibrary";
import { useImageUpload } from "./hooks/useImageUpload";
import { useFieldError } from "./EditorValidation";
import styles from "./Admin.module.css";
import formStyles from "./AdminForms.module.css";

export function MediaPicker({
  open,
  onClose,
  onSelect,
  initialValue
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  initialValue?: MediaAsset;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const library = useMediaLibrary();
  const imageUpload = useImageUpload((asset) => {
    library.addAsset(asset);
    choose(asset);
  });
  const { items, cursor, query, setQuery, loaded } = library;
  const pendingUpload = imageUpload.pending;
  const busy = library.busy || imageUpload.busy;
  const error = imageUpload.error || library.error;

  useEffect(() => {
    if (open && selected)
      selectionRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
  }, [open, selected?.src]);

  async function load(next?: string) {
    imageUpload.clearError();
    await library.load(next);
  }

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
      if (initialValue && !pendingUpload) choose(initialValue);
      if (!loaded) void load();
    } else if (dialog.current?.open) dialog.current.close();
    // Opening preserves the current search and selection when an upload fails.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    if (busy) return;
    onClose();
    lastFocus.current?.focus();
  }

  function choose(asset: MediaAsset) {
    setSelected(asset);
    setAlt(asset.alt);
    setCaption(asset.caption ?? "");
  }

  async function retryCompletion() {
    library.clearError();
    await imageUpload.retryCompletion({ alt, caption });
  }

  async function upload(file: File) {
    library.clearError();
    await imageUpload.uploadImage(file, { alt, caption });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={() => {
        if (open) onClose();
        lastFocus.current?.focus();
      }}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          event.target instanceof HTMLInputElement &&
          !event.defaultPrevented
        )
          event.preventDefault();
        if (event.key !== "Tab") return;
        const nodes = dialog.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]'
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div className={styles.dialogHeader}>
        <h2 id={titleId}>Knižnica obrázkov</h2>
        <button
          className={styles.secondary}
          type="button"
          disabled={busy}
          onClick={close}
          aria-label="Zavrieť knižnicu obrázkov"
        >
          Zavrieť ×
        </button>
      </div>
      <div className={styles.dialogBody}>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
            <TechnicalSupport />
          </p>
        ) : null}
        <div className={styles.search}>
          <input
            aria-label="Hľadať obrázky"
            placeholder="Hľadať podľa názvu alebo opisu…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void load();
              }
            }}
          />
          <button
            className={styles.secondary}
            type="button"
            disabled={busy}
            onClick={() => void load()}
          >
            Hľadať
          </button>
          <button
            className={styles.secondary}
            type="button"
            disabled={busy || !!pendingUpload}
            onClick={() => fileRef.current?.click()}
          >
            Nahrať obrázok
          </button>
          <input
            ref={fileRef}
            type="file"
            aria-label="Súbor obrázka"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            disabled={busy || !!pendingUpload}
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </div>
        {busy ? <p role="status">Načítavam alebo nahrávam obrázok…</p> : null}
        {pendingUpload ? (
          <div className={styles.notice}>
            <strong>Obrázok je nahratý, čaká na potvrdenie.</strong>
            <p>
              Potvrdenie môžete zopakovať bez opätovného odosielania súboru.
            </p>
            <label className={styles.field}>
              Opis nového obrázka
              <input
                value={alt || pendingUpload.defaultAlt}
                onChange={(event) => setAlt(event.target.value)}
              />
            </label>
            <div className={styles.actions}>
              <button
                className={styles.secondary}
                type="button"
                disabled={busy}
                onClick={() => void retryCompletion()}
              >
                Zopakovať potvrdenie obrázka
              </button>
              <button
                className={styles.remove}
                type="button"
                disabled={busy}
                onClick={() => imageUpload.discardPending()}
              >
                Pokračovať bez tohto obrázka
              </button>
            </div>
          </div>
        ) : null}
        {selected ? (
          <div ref={selectionRef} className={formStyles.selectedMedia}>
            <MediaImage image={selected} sizes="180px" fit="contain" />
            <div className={formStyles.selectedDetails}>
              <label className={styles.field}>
                Opis obrázka
                <input
                  value={alt}
                  maxLength={1000}
                  onChange={(event) => setAlt(event.target.value)}
                />
              </label>
              <label className={styles.field}>
                Titulok
                <input
                  value={caption}
                  maxLength={1000}
                  onChange={(event) => setCaption(event.target.value)}
                />
              </label>
              <div className={styles.actions}>
                <button
                  className={styles.button}
                  type="button"
                  disabled={busy || !!pendingUpload}
                  onClick={() => {
                    onSelect({
                      ...selected,
                      alt,
                      caption: caption || undefined
                    });
                    close();
                  }}
                >
                  Použiť obrázok
                </button>
                <button
                  className={styles.quietLink}
                  type="button"
                  disabled={busy}
                  onClick={close}
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className={styles.mediaGrid}>
          {items.map((image, index) => (
            <button
              className={styles.mediaTile}
              type="button"
              key={`${image.src}-${index}`}
              aria-pressed={selected?.src === image.src}
              onClick={() => choose(image)}
            >
              <MediaImage image={image} sizes="200px" />
              <span>{image.alt || "Obrázok bez opisu"}</span>
            </button>
          ))}
        </div>
        {loaded && !items.length && !busy ? (
          <p className={styles.hint}>Žiadne obrázky nezodpovedajú hľadaniu.</p>
        ) : null}
        {cursor ? (
          <button
            className={styles.secondary}
            disabled={busy}
            type="button"
            onClick={() => void load(cursor)}
          >
            Načítať ďalšie obrázky
          </button>
        ) : null}
      </div>
    </dialog>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  path,
  portrait = false
}: {
  label: string;
  value?: MediaAsset;
  onChange: (asset?: MediaAsset) => void;
  path?: string;
  portrait?: boolean;
}) {
  const error = useFieldError(path);
  const errorId = useId();
  const [open, setOpen] = useState(false);
  return (
    <div data-field={path}>
      <h3>{label}</h3>
      {error ? (
        <p id={errorId} className={formStyles.fieldError}>
          {error}
        </p>
      ) : null}
      {value ? (
        <div className={formStyles.imagePreview}>
          <MediaImage
            image={value}
            sizes={portrait ? "104px" : "200px"}
            fit={portrait ? "cover" : "contain"}
          />
          <label className={styles.field}>
            Opis obrázka
            <input
              value={value.alt}
              maxLength={1000}
              onChange={(event) =>
                onChange({ ...value, alt: event.target.value })
              }
            />
          </label>
        </div>
      ) : null}
      <div className={styles.actions}>
        <button
          className={styles.secondary}
          type="button"
          onClick={() => setOpen(true)}
          aria-describedby={error ? errorId : undefined}
        >
          {value ? "Zmeniť obrázok" : "Vybrať obrázok"}
        </button>
        {value ? (
          <button
            className={styles.remove}
            type="button"
            onClick={() => onChange(undefined)}
          >
            Odobrať z obsahu
          </button>
        ) : null}
      </div>
      <MediaPicker
        initialValue={value}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}
