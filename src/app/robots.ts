import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";
export const dynamic = "force-dynamic";

/** This is a design preview; indexing is enabled only at the release checkpoint. */
export default function robots(): MetadataRoute.Robots {
  const publicRelease =
    process.env.SITE_INDEXING_ENABLED === "true" &&
    process.env.VERCEL_ENV === "production" &&
    process.env.CONTENT_SOURCE === "database";
  return publicRelease
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/api/", "/design"]
        },
        sitemap: new URL("/sitemap.xml", siteConfig.url).href
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
