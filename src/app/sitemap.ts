import type { MetadataRoute } from "next";
import { and, isNotNull, sql } from "drizzle-orm";
import { siteConfig } from "@/content/site";
import { publicEditorialSitemap } from "@/lib/sitemap";
import { informationPages } from "@/content/information";
import { hospitalMinistry } from "@/content/hospital-ministry";
import { altarRestoration } from "@/content/altar-restoration";
import { getDb } from "@/server/db";
import { contentRecords } from "@/server/db/schema";
import { isPublicRelease } from "@/lib/seo";
import { getPublicPageLinks } from "@/server/public-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isPublicRelease()) return [];

  const pages: MetadataRoute.Sitemap = [
    "",
    "/farnost/farske-oznamy",
    hospitalMinistry.href,
    altarRestoration.href,
    "/farnost/nase-spolocenstvo",
    "/podnety",
    ...informationPages.map((page) => `/${page.slug}`),
    ...(await getPublicPageLinks()).map((page) => `/${page.route}`)
  ].map((path) => ({ url: new URL(path || "/", siteConfig.url).href }));

  const records = await getDb()
    .select({
      kind: contentRecords.kind,
      slug: contentRecords.publicSlug,
      publishedAt: contentRecords.publishedAt
    })
    .from(contentRecords)
    .where(
      and(
        isNotNull(contentRecords.published),
        isNotNull(contentRecords.publicSlug),
        sql`${contentRecords.kind} in ('article', 'news', 'notice', 'event')`
      )
    );

  pages.push(...publicEditorialSitemap(records));

  return Array.from(new Map(pages.map((page) => [page.url, page])).values());
}
