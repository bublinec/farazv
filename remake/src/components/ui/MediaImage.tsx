"use client";
import { useState } from "react";
import type { MediaAsset } from "@/content/types";
import { imageUrl } from "@/lib/images";

interface Props {
  image: MediaAsset;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  quality?: "standard" | "high";
}

export function MediaImage({
  image,
  sizes = "(max-width: 700px) 100vw, 50vw",
  className,
  priority = false,
  fit = "cover",
  quality = "standard"
}: Props) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (failedSource === image.src)
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
  const maximumWidth = Math.min(image.width, 3200);
  const widths = [
    ...[320, 480, 720, 960, 1280, 1600, 1920, 2560, 3200].filter(
      (width) => width < maximumWidth
    ),
    maximumWidth
  ];
  const deliveryQuality = quality === "high" ? "auto:best" : "auto";
  const remote = image.src.startsWith("https://res.cloudinary.com/");
  return (
    // Cloudinary performs delivery optimization; do not optimize these a second time.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl(
        image.src,
        Math.min(image.width, priority ? 1920 : 720),
        deliveryQuality
      )}
      srcSet={
        remote
          ? widths
              .map(
                (width) =>
                  `${imageUrl(image.src, width, deliveryQuality)} ${width}w`
              )
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
      onError={() => setFailedSource(image.src)}
    />
  );
}
