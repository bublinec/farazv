import "server-only";
import { cache } from "react";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import type { CalendarDate } from "@/content/types";
import type {
  EditorialDocument,
  EditorialRecordKind,
  SettingsDocument
} from "@/content/documents";
import * as fixtures from "@/content/fixtures";
import {
  allEditorialSummaries,
  decodeCursor,
  editorialPage,
  InvalidEditorialCursor
} from "@/lib/editorial";
import { editorialRecordPath } from "@/lib/record-routing";
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
  ["parish-editorial-v3", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

const cachedEntry = unstable_cache(
  store.getPublishedEntry,
  ["parish-entry-v3", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

const cachedActivePosts = unstable_cache(
  store.getPublishedActivePosts,
  ["parish-active-posts-v1", cacheNamespace],
  { tags: ["parish-published"], revalidate: 300 }
);

const cachedBulletins = unstable_cache(
  store.getPublishedBulletins,
  ["parish-bulletins-v1", cacheNamespace],
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
  cursor?: string | null,
  activeOn?: CalendarDate
) {
  if (isFixtureMode())
    return editorialPage(fixtureEditorialEntries(kind, activeOn), cursor);
  return read(() => cachedPage(kind, cursor, activeOn));
}

export async function getPublicActivePosts(today: CalendarDate) {
  if (isFixtureMode())
    return allEditorialSummaries(fixtureEditorialEntries("news", today));
  return read(() => cachedActivePosts(today));
}

function fixtureEditorialEntries(
  kind: "article" | "news",
  activeOn?: CalendarDate
) {
  const entries =
    kind === "article"
      ? fixtures.articles
      : [
          ...fixtures.news.map((entry) => {
            const poster = fixtures.posters.find(
              (item) => item.href === editorialRecordPath("news", entry.slug)
            );
            return {
              ...entry,
              posterExpiresOn: poster?.expiresOn
            };
          }),
          ...fixtures.notices.map((entry) => ({
            ...entry,
            href: editorialRecordPath("notice", entry.slug),
            posterExpiresOn: undefined
          }))
        ];
  return entries.filter(
    (entry) =>
      !activeOn ||
      !("posterExpiresOn" in entry) ||
      !entry.posterExpiresOn ||
      entry.posterExpiresOn >= activeOn
  );
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
  async (
    kind: EditorialRecordKind,
    slug: string
  ): Promise<EditorialDocument | null> => {
    if (isFixtureMode()) {
      const entry =
        (kind === "article"
          ? fixtures.articles
          : kind === "notice"
          ? fixtures.notices
          : kind === "news"
          ? fixtures.news
          : []
        ).find((entry) => entry.slug === slug) ?? null;
      if (!entry) return null;
      const poster = fixtures.posters.find(
        (item) => item.href === editorialRecordPath(kind, slug)
      );
      return {
        ...entry,
        ...(poster ? { isPoster: true } : {})
      };
    }
    return read(() => cachedEntry(kind, slug));
  }
);

export async function getPublicBulletins(today: CalendarDate) {
  if (isFixtureMode()) return fixtures.getFixtureBulletins(today);
  return read(() => cachedBulletins(today));
}
