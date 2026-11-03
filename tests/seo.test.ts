import assert from "node:assert/strict";
import test from "node:test";
import { isPublicRelease, pageMetadata } from "../src/lib/seo";
import {
  serializeStructuredData,
  editorialStructuredData,
  websiteStructuredData
} from "../src/lib/structured-data";
import { publicEditorialSitemap } from "../src/lib/sitemap";
import { productionPageDestination } from "../src/lib/production-origin";
import { saintCharbel } from "../src/content/saint-charbel";
import { siteConfig } from "../src/content/site";

const released = {
  SITE_INDEXING_ENABLED: "true",
  VERCEL_ENV: "production",
  CONTENT_SOURCE: "database"
};
const deployed = {
  VERCEL: "1",
  VERCEL_ENV: "production",
  SITE_URL: "https://farazv.sk"
};

test("indexing requires every release condition, including real database content", () => {
  assert.equal(isPublicRelease(released), true);
  for (const environment of [
    {},
    { ...released, CONTENT_SOURCE: "fixtures" },
    { ...released, VERCEL_ENV: "preview" },
    { ...released, SITE_INDEXING_ENABLED: "false" }
  ])
    assert.equal(isPublicRelease(environment), false);
});

test("page sharing has its own canonical, Slovak metadata and image fallback", () => {
  const metadata = pageMetadata({
    title: "Kontakt",
    description: "Kontakty farnosti",
    path: "/kontakt"
  });
  assert.equal(
    metadata.alternates?.canonical,
    new URL("/kontakt", siteConfig.url).href
  );
  assert.equal(metadata.openGraph?.title, "Kontakt");
  assert.equal(metadata.twitter?.title, "Kontakt");
  assert.ok(metadata.openGraph?.images);
  assert.ok(metadata.twitter?.images);
  assert.match(
    pageMetadata({ title: "Oznam", description: "", path: "/vyveska/oznam" })
      .description!,
    /Oznam/
  );
});

test("structured data preserves text while preventing script breakout and invents no author", () => {
  const entry = {
    id: "test",
    slug: "clanok",
    title: '</script><script>alert("x")</script>',
    excerpt: "Text",
    date: "2026-11-03" as const,
    blocks: []
  };
  const data = editorialStructuredData(entry, "/prispevky/clanok");
  const serialized = serializeStructuredData(data);
  assert.equal(serialized.includes("<"), false);
  assert.deepEqual(JSON.parse(serialized), data);
  assert.equal("author" in data, false);
  assert.equal("dateModified" in data, false);
  assert.equal(data.datePublished, "2026-11-03");
  assert.equal(websiteStructuredData(null)["@graph"][0]["@type"], "WebSite");
});

test("sitemap uses publication time and excludes redirected posts without hiding unrelated slugs", () => {
  const records = [
    {
      kind: "news" as const,
      slug: "clanok",
      publishedAt: "2026-10-01T10:00:00Z",
      updatedAt: "2026-11-03T10:00:00Z"
    },
    {
      kind: "news" as const,
      slug: saintCharbel.formerPostSlug,
      publishedAt: null
    },
    {
      kind: "notice" as const,
      slug: saintCharbel.formerPostSlug,
      publishedAt: null
    }
  ];
  const pages = publicEditorialSitemap(records);
  assert.equal(pages.length, 2);
  assert.equal(pages[0].lastModified, "2026-10-01T10:00:00Z");
  assert.ok(pages[1].url.includes("/vyveska/"));
  assert.equal("lastModified" in pages[1], false);
});

test("production aliases redirect public navigation without changing preview, API or mutation origins", () => {
  const alias = "https://farazv.vercel.app";
  assert.equal(
    productionPageDestination(
      `${alias}/kontakt?next=https://evil.test`,
      "GET",
      deployed
    ),
    "https://farazv.sk/kontakt?next=https://evil.test"
  );
  for (const method of ["POST", "OPTIONS", "PUT"])
    assert.equal(productionPageDestination(alias, method, deployed), null);
  for (const path of ["/api/auth/callback/google", "/admin", "/_next/a.js"])
    assert.equal(
      productionPageDestination(alias + path, "GET", deployed),
      null
    );
  assert.equal(
    productionPageDestination("https://farazv.sk/kontakt", "GET", deployed),
    null
  );
  assert.equal(
    productionPageDestination(alias, "GET", {
      ...deployed,
      VERCEL_ENV: "preview"
    }),
    null
  );
  for (const origin of [
    "http://farazv.sk",
    "https://farazv.sk/path",
    "https://user:password@farazv.sk",
    "https://farazv.sk?next=evil.test"
  ])
    assert.equal(
      productionPageDestination(alias, "GET", {
        ...deployed,
        SITE_URL: origin
      }),
      null
    );
});
