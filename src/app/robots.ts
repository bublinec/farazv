import type { MetadataRoute } from "next";
import { isPublicRelease } from "@/lib/seo";
import { siteConfig } from "@/content/site";
export const dynamic = "force-dynamic";

/** Index only real content on the explicitly released production deployment. */
export default function robots(): MetadataRoute.Robots {
  return isPublicRelease()
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
