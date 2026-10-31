"use client";
import { useEffect, useState } from "react";
import type { MediaAsset } from "@/content/types";
import { imageUrl } from "@/lib/images";

interface Props {
  image: MediaAsset;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}

export function MediaImage({
  image,
  sizes = "(max-width: 700px) 100vw, 50vw",
  className,
  priority = false,
  fit = "cover"
}: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image.src]);
  if (failed)
    return (
      <span
        role="img"
        aria-label={`Obrázok momentálne nie je dostupný. ${image.alt}`}
        className={`mediaMissing ${className ?? ""}`}
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <span aria-hidden="true">▧</span>
        <span>Obrázok momentálne nie je dostupný.</span>
      </span>
    );
  const widths = [320, 480, 720, 960, 1280, 1600].filter(
    (width) => width <= Math.max(image.width, 320)
  );
  const remote = image.src.startsWith("https://res.cloudinary.com/");
  return (
    // Cloudinary performs delivery optimization; do not optimize these a second time.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl(image.src, priority ? 1280 : 720)}
      srcSet={
        remote
          ? widths
              .map((width) => `${imageUrl(image.src, width)} ${width}w`)
              .join(", ")
          : undefined
      }
      sizes={remote ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={image.alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ objectFit: fit }}
      onError={() => setFailed(true)}
    />
  );
}
