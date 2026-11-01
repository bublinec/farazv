"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaAsset } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import { ImageDialog } from "@/components/ui/ImageLightbox";
import styles from "./ImageGallery.module.css";

/** Native modal background inertness, Escape, and focus return; explicit Tab wrap. */
export function ImageGallery({ images }: { images: MediaAsset[] }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const grid = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const open = activeIndex !== null;
  const active = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (pendingFocus.current === null) return;
    grid.current
      ?.querySelectorAll<HTMLButtonElement>("button")
      [pendingFocus.current]?.focus();
    pendingFocus.current = null;
  }, [visibleCount]);

  function move(offset: number) {
    setActiveIndex((current) =>
      current === null
        ? null
        : (current + offset + images.length) % images.length
    );
  }

  if (!images.length) return null;

  return (
    <>
      <div className={styles.grid} ref={grid}>
        {images.slice(0, visibleCount).map((image, index) => (
          <button
            type="button"
            className={styles.thumbnail}
            key={`${image.src}-${index}`}
            onClick={() => setActiveIndex(index)}
            aria-haspopup="dialog"
          >
            <span className="srOnly">
              Zväčšiť fotografiu: {image.alt ? "" : index + 1}{" "}
            </span>
            <MediaImage image={image} sizes="(max-width: 760px) 50vw, 25vw" />
            <span className={styles.expand} aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
      {images.length > 12 ? (
        <div className={styles.more}>
          <p aria-live="polite">
            {Math.min(visibleCount, images.length)} z {images.length} fotografií
          </p>
          {visibleCount < images.length ? (
            <button
              type="button"
              className="buttonOutline"
              onClick={() => {
                pendingFocus.current = visibleCount;
                setVisibleCount((count) => Math.min(count + 12, images.length));
              }}
            >
              Zobraziť ďalšie fotografie <span aria-hidden="true">↓</span>
            </button>
          ) : (
            <span className={styles.complete}>
              Zobrazené všetky fotografie.
            </span>
          )}
        </div>
      ) : null}
      <ImageDialog
        open={open}
        onClose={() => setActiveIndex(null)}
        onMove={move}
        className={styles.dialog}
        label="Prehliadač fotografií"
      >
        {active && (
          <div className={styles.lightbox}>
            <div className={styles.toolbar}>
              <span aria-live="polite">
                {(activeIndex ?? 0) + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className={styles.close}
                autoFocus
                aria-label="Zavrieť galériu"
              >
                Zavrieť <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className={styles.stage}>
              {images.length > 1 && (
                <button
                  type="button"
                  className={`${styles.direction} ${styles.previous}`}
                  onClick={() => move(-1)}
                  aria-label="Predchádzajúca fotografia"
                >
                  ←
                </button>
              )}
              <figure className={styles.figure}>
                <MediaImage
                  key={active.src}
                  image={active}
                  fit="contain"
                  sizes="(max-width: 760px) 95vw, 85vw"
                  priority
                />
                <figcaption>{active.caption || active.alt}</figcaption>
              </figure>
              {images.length > 1 && (
                <button
                  type="button"
                  className={`${styles.direction} ${styles.next}`}
                  onClick={() => move(1)}
                  aria-label="Nasledujúca fotografia"
                >
                  →
                </button>
              )}
            </div>
            <p className={styles.hint}>
              Fotografie môžete prepínať aj šípkami na klávesnici.
            </p>
          </div>
        )}
      </ImageDialog>
    </>
  );
}
