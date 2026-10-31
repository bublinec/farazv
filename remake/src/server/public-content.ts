import "server-only";
import { cache } from "react";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { CalendarDate, Poster } from "@/content/types";
import type {
  EditorialDocument,
  RecordKind,
  SettingsDocument
} from "@/content/documents";
import * as fixtures from "@/content/fixtures";
import {
  decodeCursor,
  editorialPage,
  InvalidEditorialCursor
} from "@/lib/editorial";
import * as store from "./published-store";
import { ContentUnavailableError } from "./errors";

export function isFixtureMode() {
  return (
    process.env.CONTENT_SOURCE === "fixtures" &&
    process.env.VERCEL_ENV !== "production" &&
    process.env.SITE_INDEXING_ENABLED !== "true"
  );
}

const cacheNamespace = createHash("sha256")
  .update(process.env.DATABASE_URL || "unconfigured")
  .digest("hex")
  .slice(0, 16);

const cachedSettings = unstable_cache(
  store.getPublishedSettings,
  ["parish-settings-v1", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

const cachedPage = unstable_cache(
  store.getPublishedEditorialPage,
  ["parish-editorial-v1", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

const cachedEntry = unstable_cache(
  store.getPublishedEntry,
  ["parish-entry-v1", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

const cachedBulletins = unstable_cache(
  store.getPublishedBulletins,
  ["parish-bulletins-v1", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

const cachedPosters = unstable_cache(
  store.getPosterCandidates,
  ["parish-posters-v1", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

async function read<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof InvalidEditorialCursor) throw error;
    throw new ContentUnavailableError();
  }
}

export const getPublicSettings = cache(
  async (): Promise<SettingsDocument | null> => {
    if (isFixtureMode())
      return {
        ...fixtures.siteSettings,
        regularSchedule: fixtures.regularSchedule,
        donationQr: {
          src: "/media/donations-qr.png",
          width: 260,
          height: 260,
          alt: "QR kód pre príspevok na chod farnosti"
        }
      };
    return read(cachedSettings);
  }
);

export async function getPublicEditorialPage(
  kind: "article" | "news",
  cursor?: string | null
) {
  if (isFixtureMode())
    return editorialPage(
      kind === "article" ? fixtures.articles : fixtures.news,
      cursor
    );
  return read(() => cachedPage(kind, cursor));
}

export function parsePublicCursor(params: URLSearchParams) {
  for (const key of params.keys())
    if (key !== "cursor") throw new InvalidEditorialCursor();
  if (params.getAll("cursor").length > 1 || params.get("cursor") === "")
    throw new InvalidEditorialCursor();
  const cursor = params.get("cursor");
  if (cursor) decodeCursor(cursor);
  return cursor;
}

export const getPublicEntry = cache(
  async (kind: RecordKind, slug: string): Promise<EditorialDocument | null> => {
    if (isFixtureMode())
      return (
        (kind === "article"
          ? fixtures.articles
          : kind === "notice"
          ? fixtures.notices
          : fixtures.news
        ).find((entry) => entry.slug === slug) ?? null
      );
    return read(() => cachedEntry(kind, slug));
  }
);

export async function getPublicBulletins(today: CalendarDate) {
  if (isFixtureMode()) return fixtures.getFixtureBulletins(today);
  return read(() => cachedBulletins(today));
}

export async function getPublicPosters(today: CalendarDate): Promise<Poster[]> {
  if (isFixtureMode())
    return fixtures.posters
      .filter((poster) => !poster.expiresOn || poster.expiresOn >= today)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  const entries = await read(cachedPosters);

  return entries
    .filter(
      (entry) =>
        entry.cover &&
        (!entry.posterExpiresOn || entry.posterExpiresOn >= today)
    )
    .slice(0, 6)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      image: entry.cover!,
      date: entry.date,
      expiresOn: entry.posterExpiresOn as CalendarDate | undefined,
      href:
        entry.posterDestination ||
        (entry.blocks.length ||
        entry.body?.content.some(
          (node) => node.type !== "paragraph" || !!node.content?.length
        )
          ? entry.recordKind === "article"
            ? `/farnost/nase-spolocenstvo/${entry.slug}`
            : entry.recordKind === "notice"
            ? `/vyveska/${entry.slug}`
            : `/prispevky/${entry.slug}`
          : undefined)
    }));
}
