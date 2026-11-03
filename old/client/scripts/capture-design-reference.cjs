#!/usr/bin/env node
/* Run with Playwright, Cheerio and Sharp available to Node (see archive README). */
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require("playwright");
const cheerio = require("cheerio");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const ORIGIN = "https://farazv.sk";
const DATE = process.env.CAPTURE_DATE || new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Bratislava"
}).format(new Date());
const OUTPUT = path.join(ROOT, "../..", "design-reference", DATE);
const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 }
};
const assets = new Map();
const failures = new Map();
const normalize = url => new URL(url, ORIGIN).pathname.replace(/\/$/, "") || "/";
const pageId = route => route === "/" ? "home" : route.slice(1).replaceAll("/", "--");
const escape = text => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const assetTypes = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
  "image/avif": ".avif", "image/svg+xml": ".svg", "image/gif": ".gif",
  "font/woff": ".woff", "font/woff2": ".woff2", "font/ttf": ".ttf",
  "application/font-woff": ".woff", "text/css": ".css"
};

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

async function saveAsset(url, buffer, type) {
  const extension = assetTypes[type.split(";")[0]] || path.extname(new URL(url).pathname).slice(0,10) || ".bin";
  const name = crypto.createHash("sha256").update(buffer).digest("hex").slice(0,24) + extension;
  await fs.writeFile(path.join(OUTPUT, "assets", name), buffer);
  return name;
}

async function asset(url) {
  if (!assets.has(url)) {
    assets.set(url, (async () => {
      try {
        const response = await get(url);
        const buffer = Buffer.from(await response.arrayBuffer());
        return await saveAsset(url, buffer, response.headers.get("content-type") || "");
      } catch (error) {
        failures.set(url, error.message);
        return null;
      }
    })());
  }
  return assets.get(url);
}

async function localUrl(value, base, prefix = "../../assets/") {
  if (!value || /^(data:|blob:|#|mailto:|tel:)/i.test(value)) return value;
  const url = new URL(value, base).href;
  if (!/^https?:/.test(url)) return value;
  const name = await asset(url);
  // A missing image stays visibly missing, without contacting production offline.
  return name ? prefix + name : "data:,";
}

async function localCss(css, base) {
  const pattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g;
  const matches = [...css.matchAll(pattern)];
  const replacements = await Promise.all(matches.map(async match => [
    match[0], `url("${await localUrl(match[1] ?? match[2] ?? match[3], base)}")`
  ]));
  for (const [from, to] of replacements) css = css.split(from).join(to);
  return css;
}

async function freezeHtml(raw, url, routes, viewport) {
  const $ = cheerio.load(raw);
  $("script, noscript, base, link[rel=preload], link[rel=prefetch], link[rel=preconnect], link[rel=dns-prefetch], link[rel=manifest], meta[http-equiv]").remove();
  await Promise.all($("link[rel=stylesheet]").toArray().map(async element => {
    const href = new URL($(element).attr("href"), url).href;
    try {
      const css = await (await get(href)).text();
      $(element).replaceWith($("<style>").attr("data-reference-localized", "").text(await localCss(css, href)));
    } catch (error) {
      failures.set(href, error.message);
      $(element).remove();
    }
  }));
  await Promise.all($("style").toArray().map(async element => {
    if ($(element).attr("data-reference-localized") !== undefined) return;
    $(element).text(await localCss($(element).text(), url));
  }));
  await Promise.all($("[style]").toArray().map(async element => {
    $(element).attr("style", await localCss($(element).attr("style"), url));
  }));
  await Promise.all($("img[src], source[src], video[poster], link[rel=icon], link[rel='shortcut icon'], link[rel='apple-touch-icon'], input[type=image]").toArray().map(async element => {
    const attribute = element.name === "link" ? "href" : $(element).attr("poster") ? "poster" : "src";
    if ($(element).attr(attribute)) $(element).attr(attribute, await localUrl($(element).attr(attribute), url));
  }));
  $("source[srcset], iframe, embed, object").each((_, element) => {
    if (element.name === "source") { $(element).remove(); return; }
    const source = $(element).attr("src") || $(element).attr("data");
    $(element).replaceWith($("<div>").attr("style", "padding:24px;background:#eee;color:#333")
      .append($("<a>").attr("href", source ? new URL(source, url).href : url).text("External embed — view original online")));
  });
  $("img").removeAttr("srcset").removeAttr("sizes").removeAttr("loading");
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (/^(mailto:|tel:|#)/.test(href)) return;
    const target = new URL(href, url);
    const route = normalize(target.href);
    $(element).attr("href", target.origin === ORIGIN && routes.has(route)
      ? `../${pageId(route)}/${viewport}.html${target.hash}` : target.href);
  });
  $("form").removeAttr("action").removeAttr("method");
  $("button, input[type=submit]").attr("disabled", "disabled");
  $("*").each((_, element) => {
    for (const attribute of Object.keys(element.attribs || {})) {
      if (/^on/i.test(attribute)) $(element).removeAttr(attribute);
    }
  });
  $("head").prepend('<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src \'self\' data: file:; style-src \'self\' \'unsafe-inline\' file:; font-src \'self\' data: file:; media-src \'self\' data: file:; form-action \'none\'">');
  return "<!DOCTYPE html>\n" + $.html();
}

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach(img => { img.loading = "eager"; });
  });
  // Trigger Gatsby/IntersectionObserver images throughout the page.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 70));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    await Promise.race([
      Promise.all([...document.images].map(img => img.decode().catch(() => {}))),
      new Promise(resolve => setTimeout(resolve, 10000))
    ]);
  });
  await page.waitForTimeout(700);
}

async function capture(browser, route, routes) {
  const directory = path.join(OUTPUT, "pages", pageId(route.path));
  await fs.mkdir(directory, { recursive: true });
  const record = { ...route, url: ORIGIN + route.path, files: {}, views: {} };
  for (const [viewport, size] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({
      viewport: size, deviceScaleFactor: 1, locale: "sk-SK",
      timezoneId: "Europe/Bratislava", reducedMotion: "reduce",
      serviceWorkers: "block"
    });
    const page = await context.newPage();
    const pending = [];
    page.on("response", response => {
      const type = response.request().resourceType();
      const url = response.url();
      if (!["image", "font"].includes(type) || !response.ok() || !url.startsWith("http") || assets.has(url)) return;
      const promise = (async () => {
        try {
          return await saveAsset(url, await response.body(), response.headers()["content-type"] || "");
        } catch {
          assets.delete(url);
          return asset(url);
        }
      })();
      assets.set(url, promise);
      pending.push(promise);
    });
    try {
      const response = await page.goto(record.url, { waitUntil: "domcontentloaded", timeout: 45000 });
      if (viewport === "desktop") {
        record.status = response.status();
        record.finalUrl = page.url();
        record.title = await page.title();
        await fs.writeFile(path.join(directory, "source.html"), await response.body());
      }
      await settle(page);
      await page.screenshot({ path: path.join(directory, `${viewport}.png`), fullPage: true, animations: "disabled" });
      const snapshot = await page.evaluate(() => {
        const clone = document.documentElement.cloneNode(true);
        // Emotion inserts CSS via CSSOM, which outerHTML alone would lose.
        [...document.querySelectorAll("style")].forEach((style, index) => {
          try { clone.querySelectorAll("style")[index].textContent = [...style.sheet.cssRules].map(rule => rule.cssText).join("\n"); } catch {}
        });
        [...document.images].forEach((image, index) => {
          if (image.currentSrc) clone.querySelectorAll("img")[index].setAttribute("src", image.currentSrc);
        });
        return {
          html: clone.outerHTML,
          height: document.documentElement.scrollHeight,
          brokenImages: [...document.images].filter(img => !img.naturalWidth && img.getBoundingClientRect().width > 0).map(img => img.currentSrc || img.src),
          headings: [...document.querySelectorAll("h1,h2")].map(element => element.textContent)
        };
      });
      await Promise.allSettled(pending);
      const html = await freezeHtml(snapshot.html, page.url(), routes, viewport);
      await fs.writeFile(path.join(directory, `${viewport}.html`), html);
      record.files[viewport] = `pages/${pageId(route.path)}/${viewport}.html`;
      record.views[viewport] = { ...size, height: snapshot.height, brokenImages: [...new Set(snapshot.brokenImages)] };
      if (viewport === "desktop") {
        record.headings = snapshot.headings;
        await sharp(path.join(directory, "desktop.png"))
          .extract({ left: 0, top: 0, width: size.width, height: Math.min(1000, snapshot.height) })
          .resize(432).webp({ quality: 80 }).toFile(path.join(directory, "thumbnail.webp"));
      }
    } finally {
      await context.close();
    }
  }
  record.capturedAt = new Date().toISOString();
  await fs.writeFile(path.join(directory, "metadata.json"), JSON.stringify(record, null, 2) + "\n");
  console.log(`${record.status} ${route.path} (${record.views.desktop.height}px / ${record.views.mobile.height}px)`);
  return record;
}

async function inventory() {
  const sources = (await fs.readdir(path.join(ROOT, "src/pages"), { recursive: true })).filter(file => file.endsWith(".tsx"));
  const fixed = sources.filter(file => !file.includes("{")).map(source => ({
    path: source === "404.tsx" ? "/404.html" : "/" + source.replace(/(^|\/)index\.tsx$/, "").replace(/\.tsx$/, "").replace(/\/$/, ""),
    type: source === "404.tsx" ? "error" : "fixed",
    source: "src/pages/" + source
  }));
  const home = await (await get(ORIGIN + "/page-data/index/page-data.json")).json();
  const queries = await Promise.all(home.staticQueryHashes.map(async hash =>
    (await (await get(`${ORIGIN}/page-data/sq/d/${hash}.json`)).json()).data));
  const posts = queries.find(query => query.allStrapiPost)?.allStrapiPost.nodes;
  const articles = queries.find(query => query.STRAPI?.articles)?.STRAPI.articles;
  const notices = queries.find(query => query.allStrapiAnnouncements)?.allStrapiAnnouncements.nodes;
  const article = articles?.find(item => item.slug === "kolegium-antona-neuwirtha") || articles?.[0];
  for (const [item, prefix, source] of [
    [posts?.[0], "/prispevky/", "src/pages/prispevky/{StrapiPost.slug}.tsx"],
    [article, "/farnost/nase-spolocenstvo/", "src/pages/farnost/nase-spolocenstvo/{strapiArticles.slug}.tsx"],
    [notices?.[0], "/vyveska/", "src/pages/vyveska/{StrapiAnnouncements.slug}.tsx"]
  ]) {
    if (!item?.slug) throw new Error(`No deployed example found for ${source}`);
    fixed.push({ path: prefix + item.slug, type: "dynamic example", source });
  }
  return fixed.sort((a,b) => a.path.localeCompare(b.path));
}

async function main() {
  await fs.mkdir(path.join(OUTPUT, "assets"), { recursive: true });
  const allRoutes = await inventory();
  const routes = new Set(allRoutes.map(route => route.path));
  const selected = process.env.CAPTURE_PATH ? allRoutes.filter(route => route.path === process.env.CAPTURE_PATH) : allRoutes;
  await fs.writeFile(path.join(OUTPUT, "routes.json"), JSON.stringify(allRoutes, null, 2) + "\n");
  const browser = await chromium.launch({
    channel: process.env.CHROME_CHANNEL || "chrome", headless: true
  });
  const results = [];
  const errors = [];
  try {
    // Two pages at a time keeps the public host's request load modest.
    const queue = [...selected];
    await Promise.all([0,1].map(async () => {
      while (queue.length) {
        const route = queue.shift();
        try { results.push(await capture(browser, route, routes)); }
        catch (error) {
          errors.push({ path: route.path, error: error.message });
          console.error(`FAILED ${route.path}: ${error.message}`);
        }
      }
    }));
  } finally {
    await browser.close();
  }
  results.sort((a,b) => a.path.localeCompare(b.path));
  const assetIndex = [];
  for (const [url, name] of assets) assetIndex.push({ url, file: await name });
  const manifest = { origin: ORIGIN, date: DATE, timezone: "Europe/Bratislava", viewports: VIEWPORTS, pages: results, errors, assetFailures: [...failures].map(([url,error]) => ({url,error})), assets: assetIndex };
  await fs.writeFile(path.join(OUTPUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  const cards = results.map(record => {
    const folder = `pages/${pageId(record.path)}`;
    return `<article><a href="${folder}/desktop.html"><img src="${folder}/thumbnail.webp" alt="" loading="lazy"></a><div><h2>${escape(record.title)}</h2><code>${escape(record.path)}</code><p>${escape(record.type)} · HTTP ${record.status}</p><nav><a href="${folder}/desktop.html">Desktop HTML</a><a href="${folder}/mobile.html">Mobile HTML</a><a href="${folder}/desktop.png">Desktop PNG</a><a href="${folder}/mobile.png">Mobile PNG</a><a href="${folder}/source.html">Original source</a><a href="${escape(record.url)}">Live page ↗</a></nav></div></article>`;
  }).join("\n");
  await fs.writeFile(path.join(OUTPUT, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Farazv design reference — ${DATE}</title><style>body{font:16px system-ui,sans-serif;background:#f4f3f0;color:#222;margin:0;padding:40px;max-width:1500px;margin:auto}h1{margin-bottom:8px}header p{max-width:900px;line-height:1.6}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-top:32px}article{border:1px solid #ddd;background:#fff;border-radius:10px;overflow:hidden}article img{width:100%;display:block;aspect-ratio:1.44;object-fit:cover;object-position:top}article div{padding:20px}h2{font-size:19px;margin:0 0 10px}code{font-size:12px;overflow-wrap:anywhere}nav{display:flex;gap:12px;flex-wrap:wrap;font-size:14px}a{color:#825026}article p{color:#666;font-size:13px}</style><header><h1>Farazv design reference</h1><p>Captured ${DATE} from <a href="${ORIGIN}">farazv.sk</a>. ${results.length} pages, with desktop (1440 × 1000) and mobile (390 × 844) full-page screenshots. HTML copies use local images and fonts. They preserve the captured layout; menus, carousels, forms and external embeds are static. Open mobile HTML in a 390px-wide viewport for the captured layout.</p><p><a href="manifest.json">Capture manifest</a> · <a href="README.md">Notes and coverage</a></p></header><main>${cards}</main></html>\n`);
  console.log(`Saved ${results.length}/${selected.length} pages; ${errors.length} errors; ${failures.size} asset failures to ${OUTPUT}`);
  if (errors.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
