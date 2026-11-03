import assert from "node:assert/strict";
import { load } from "cheerio";

const options = process.argv.slice(2);
const originIndex = options.indexOf("--origin");
const origin = new URL(
  originIndex === -1 ? "https://farazv.sk" : options[originIndex + 1]
);
assert.equal(origin.protocol, "https:", "Production checks require HTTPS");
assert.equal(origin.pathname, "/", "Use an origin, not a path");
const allPages = options.includes("--all-pages");
const failures = [];

async function request(path, redirect = "manual") {
  const response = await fetch(new URL(path, origin), {
    redirect,
    signal: AbortSignal.timeout(25_000),
    headers: { "User-Agent": "Farazv-production-check/1.0" }
  });
  const body = await response.text();
  return { response, body };
}

async function check(label, action) {
  try {
    await action();
    console.log(`PASS ${label}`);
  } catch (error) {
    failures.push(label);
    console.error(
      `FAIL ${label}: ${
        error instanceof Error ? error.message : "request failed"
      }`
    );
  }
}

await check("database health", async () => {
  const { response, body } = await request("/api/health");
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(body).status, "ok");
  assert.match(response.headers.get("cache-control") || "", /no-store/);
});
await check("indexing and sitemap discovery", async () => {
  const { response, body } = await request("/robots.txt");
  assert.equal(response.status, 200);
  assert.match(body, /^Allow: \/$/m);
  assert.ok(body.includes(`Sitemap: ${new URL("/sitemap.xml", origin).href}`));
  assert.match(body, /^Disallow: \/admin/m);
});
let urls = [];
await check("canonical public sitemap", async () => {
  const { response, body } = await request("/sitemap.xml");
  assert.equal(response.status, 200);
  const $ = load(body, { xmlMode: true });
  urls = $("url > loc")
    .map((_, element) => $(element).text())
    .get();
  assert.ok(urls.length > 20, "Expected the complete public route inventory");
  assert.equal(new Set(urls).size, urls.length, "Duplicate sitemap URLs");
  for (const value of urls) {
    const url = new URL(value);
    assert.equal(url.origin, origin.origin);
    assert.ok(!/^\/(admin|api|design)(?:\/|$)/.test(url.pathname));
    assert.equal(url.search + url.hash, "");
  }
});
const representative = [
  "/",
  "/kontakt",
  "/farnost/farske-oznamy",
  "/farnost/o-farnosti",
  "/farnost/nase-spolocenstvo",
  "/sviatosti/sviatost-krstu",
  "/farnost/obnova-oltarov"
];
for (const prefix of [
  "/farnost/nase-spolocenstvo/",
  "/prispevky/",
  "/vyveska/"
]) {
  const example = urls.find((url) => new URL(url).pathname.startsWith(prefix));
  if (example) representative.push(new URL(example).pathname);
}
const paths = allPages
  ? urls.map((url) => new URL(url).pathname)
  : representative;
for (let index = 0; index < paths.length; index += 3) {
  await Promise.all(
    paths.slice(index, index + 3).map((path) =>
      check(`page ${path}`, async () => {
        const { response, body } = await request(path);
        assert.equal(
          response.status,
          200,
          "Sitemap pages must be direct HTTP 200 responses"
        );
        const $ = load(body);
        assert.ok($("title").text().trim());
        assert.ok($("meta[name=description]").attr("content")?.trim());
        assert.equal($("link[rel=canonical]").length, 1);
        assert.equal(
          new URL($("link[rel=canonical]").attr("href")).href,
          new URL(path, origin).href
        );
        assert.ok(
          !/noindex/.test($("meta[name=robots]").attr("content") || "")
        );
        assert.ok($("meta[property='og:image']").attr("content"));
        assert.equal(
          $("meta[name='twitter:card']").attr("content"),
          "summary_large_image"
        );
        assert.equal($("html").attr("lang"), "sk");
        assert.equal($("main h1").length, 1);
        assert.equal(response.headers.get("x-content-type-options"), "nosniff");
        if (path === "/") {
          const structured = $("script[type='application/ld+json']")
            .map((_, e) => JSON.parse($(e).text()))
            .get();
          assert.ok(JSON.stringify(structured).includes('"WebSite"'));
        }
      })
    )
  );
}
await check("unknown URLs return 404", async () => {
  const { response } = await request(
    "/production-check-nonexistent-page-841da5"
  );
  assert.equal(response.status, 404);
});
await check("admin login remains unindexed", async () => {
  const { response, body } = await request("/admin/login");
  assert.equal(response.status, 200);
  assert.match(
    `${response.headers.get("x-robots-tag")} ${load(body)(
      "meta[name=robots]"
    ).attr("content")}`,
    /noindex/
  );
});
for (const [path, destination] of [
  ["/prispevky", "/#vyveska"],
  ["/birmovanci", "/sviatosti/sviatost-birmovania"],
  ["/farnost/galeria", "/farnost/kostol-sv-alzbety#galeria"]
]) {
  await check(`permanent legacy redirect ${path}`, async () => {
    const { response } = await request(path);
    assert.ok([301, 308].includes(response.status));
    assert.equal(
      new URL(response.headers.get("location"), origin).href,
      new URL(destination, origin).href
    );
  });
}
console.log(
  `Checked ${paths.length} public pages; ${failures.length} failed checks.`
);
if (failures.length) process.exitCode = 1;
