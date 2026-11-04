import type { Metadata } from "next";
import { aerialImage } from "@/content/assets";
import { siteConfig } from "@/content/site";
import type { MediaAsset } from "@/content/types";
import { searchMetadataByPath } from "@/content/search-metadata";

type IndexingEnvironment = {
  SITE_INDEXING_ENABLED?: string;
  VERCEL_ENV?: string;
  CONTENT_SOURCE?: string;
};

/** Fixtures and preview deployments must never become searchable. */
export function isPublicRelease(
  environment: IndexingEnvironment = {
    SITE_INDEXING_ENABLED: process.env.SITE_INDEXING_ENABLED,
    VERCEL_ENV: process.env.VERCEL_ENV,
    CONTENT_SOURCE: process.env.CONTENT_SOURCE
  }
) {
  return (
    environment.SITE_INDEXING_ENABLED === "true" &&
    environment.VERCEL_ENV === "production" &&
    environment.CONTENT_SOURCE === "database"
  );
}

export function pageMetadata({
  title,
  description,
  path,
  image = aerialImage,
  article,
  absoluteTitle = false
}: {
  title: string;
  description: string;
  path: string;
  image?: MediaAsset;
  article?: { publishedTime: string; author?: string };
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = new URL(path, siteConfig.url).href;
  const copy = searchMetadataByPath[path];
  title = copy?.title ?? title;
  description = compactSearchDescription(
    copy?.description ||
      description ||
      `${title} · ${siteConfig.name} ${siteConfig.city}`
  );
  if (!description)
    description = compactSearchDescription(
      `${title} · ${siteConfig.name} ${siteConfig.city}`
    );
  const shareImage = {
    url: image.src,
    width: image.width,
    height: image.height,
    alt: image.alt || title
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "sk_SK",
      siteName: `${siteConfig.name} · ${siteConfig.city}`,
      images: [shareImage],
      ...(article
        ? {
            type: "article",
            publishedTime: article.publishedTime,
            ...(article.author ? { authors: [article.author] } : {})
          }
        : { type: "website" })
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.src, alt: image.alt || title }]
    }
  };
}

/** Keep fallback excerpts concise without cutting a word or changing reading copy. */
export function compactSearchDescription(value: string): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;

  const prefix = text.slice(0, 159);
  const boundary = prefix.lastIndexOf(" ");
  return `${prefix
    .slice(0, boundary > 0 ? boundary : prefix.length)
    .trimEnd()}…`;
}
