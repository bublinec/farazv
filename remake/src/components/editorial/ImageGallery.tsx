"use client";

import { useId, useState } from "react";
import type { MediaAsset } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import { ImageDialog } from "@/components/ui/ImageLightbox";
import styles from "./ImageGallery.module.css";

export function ImageGallery({ images }: { images: MediaAsset[] }) {
  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  if (!images.length) return null;
  const active = images[selected];

  function open(index: number) {
    setSelected(index);
    setIsOpen(true);
  }

  return (
    <div className={styles.gallery}>
      <div
        className={`${styles.grid} ${images.length === 1 ? styles.single : ""}`}
      >
        {images.map((image, index) => (
          <figure key={`${image.src}-${index}`}>
            <button type="button" onClick={() => open(index)}>
              <span className="srOnly">
                Zväčšiť fotografiu: {image.alt ? "" : index + 1}{" "}
              </span>
              <MediaImage
                image={image}
                sizes={
                  images.length === 1
                    ? "(max-width: 800px) 100vw, 760px"
                    : "(max-width: 600px) 50vw, 380px"
                }
                fit={images.length === 1 ? "contain" : "cover"}
              />
              <span className={styles.zoom} aria-hidden="true">
                ↗
              </span>
            </button>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <ImageDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onMove={(offset) =>
          setSelected((index) =>
            Math.max(0, Math.min(images.length - 1, index + offset))
          )
        }
        className={styles.dialog}
        labelledBy={titleId}
      >
        <div className={styles.viewer}>
          <div className={styles.toolbar}>
            <span id={titleId}>
              Fotografia {selected + 1} z {images.length}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Zavrieť fotografiu"
              autoFocus
            >
              Zavrieť <span aria-hidden="true">×</span>
            </button>
          </div>
          {isOpen && (
            <MediaImage
              image={active}
              sizes="95vw"
              fit="contain"
              className={styles.fullImage}
            />
          )}
          {isOpen && (active.caption || active.alt) && (
            <p className={styles.caption}>{active.caption || active.alt}</p>
          )}
          {images.length > 1 && (
            <div className={styles.controls}>
              <button
                type="button"
                disabled={selected === 0}
                onClick={() => setSelected((index) => index - 1)}
              >
                ← Predchádzajúca
              </button>
              <button
                type="button"
                disabled={selected === images.length - 1}
                onClick={() => setSelected((index) => index + 1)}
              >
                Ďalšia →
              </button>
            </div>
          )}
        </div>
      </ImageDialog>
    </div>
  );
}
