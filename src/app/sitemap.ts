import type { MetadataRoute } from "next";
import { and, isNotNull, sql } from "drizzle-orm";
import { siteConfig } from "@/content/site";
import type { EditorialRecordKind } from "@/content/documents";
import { informationPages } from "@/content/information";
import { saintCharbel } from "@/content/saint-charbel";
import { hospitalMinistry } from "@/content/hospital-ministry";
import { altarRestoration } from "@/content/altar-restoration";
import { editorialRecordPath } from "@/lib/record-routing";
import { getDb } from "@/server/db";
import { contentRecords } from "@/server/db/schema";
import { isFixtureMode } from "@/server/public-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (
    isFixtureMode() ||
    process.env.SITE_INDEXING_ENABLED !== "true" ||
    process.env.VERCEL_ENV !== "production"
  )
    return [];

  const pages: MetadataRoute.Sitemap = [
    "",
    "/farnost/farske-oznamy",
    hospitalMinistry.href,
    altarRestoration.href,
    "/farnost/nase-spolocenstvo",
    "/podnety",
    ...informationPages.map((page) => `/${page.slug}`)
  ].map((path) => ({ url: new URL(path || "/", siteConfig.url).href }));

  const records = await getDb()
    .select({
      kind: contentRecords.kind,
      slug: contentRecords.publicSlug,
      updatedAt: contentRecords.updatedAt
    })
    .from(contentRecords)
    .where(
      and(
        isNotNull(contentRecords.published),
        isNotNull(contentRecords.publicSlug),
        sql`${contentRecords.kind} in ('article', 'news', 'notice', 'event')`
      )
    );

  for (const record of records) {
    if (
      record.kind !== "article" &&
      (record.slug === saintCharbel.formerPostSlug ||
        record.slug === altarRestoration.postSlug)
    )
      continue;

    pages.push({
      url: new URL(
        editorialRecordPath(record.kind as EditorialRecordKind, record.slug!),
        siteConfig.url
      ).href,
      lastModified: record.updatedAt
    });
  }

  return pages;
}
