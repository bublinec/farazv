# Accessibility and local performance audit

[Operations](operations.md) · [Migration review](migration.md) · [Remake plan](../../docs/remake/plan.md)

Audit date: **31 October 2026**. This record distinguishes automated checks and
local lab measurements from manual accessibility review and production traffic.

## Reproduce

Run the WCAG 2 A/AA and WCAG 2.1 A/AA checks against an owned fixture preview:

```sh
npm run test:accessibility
```

Against an already running local production preview:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3101 PLAYWRIGHT_EXTERNAL_SERVER=1 npm run test:accessibility
node --import tsx scripts/audit-performance.ts --base-url http://127.0.0.1:3101 --output .private/performance/local-production.json
```

For the migrated article with unavailable historical photographs, add
`A11Y_MISSING_IMAGE_PATH=/farnost/nase-spolocenstvo/ludove-misie` to the accessibility
command. This adds a check of both its fallback thumbnails and opened viewer.
The performance collector accepts the same path with `--route` for a separate
mobile sample.

The accessibility suite checks the home page at desktop/mobile widths, weekly
bulletin, contact, baptism, article listing/detail, gallery, editor login, open
mobile menu and open photograph viewer. Each scan attaches rule failures and
incomplete checks to the Playwright report. It also checks one main landmark,
one primary heading and Slovak document language. CI runs this suite with
explicit public fixtures, without production credentials.

## Findings and changes

- The brand's overriding accessible name omitted part of its visible parish
  name. The link now takes its name directly from the visible identity.
- Calendar buttons showed abbreviated weekdays or “Dnes” with a day number,
  while their accessible names contained only expanded dates. Names now include
  the visible text and complete date; an explicit text space separates the
  weekday and number in the DOM.
- Small donation text had **4.29:1** contrast on its cream background. The shared
  muted text token changed from `#687075` to `#5f686e`; fixture scans pass that
  contrast check. Existing gold/blue parish identity is retained.
- A focused isolated-database editor test confirms categorized donations can
  retain an amount without an invented donor name, survive publication, appear
  in private preview, and fit a 390-pixel viewport.
- Unavailable historical photographs displayed a fallback message that was
  omitted from gallery buttons' accessible names. Gallery/image actions now
  derive their names from the actual image or fallback. The photograph viewer
  also uses the fallback and an opaque dark background, keeping its navigation
  text legible when a source photograph is missing.
- The labelled baptism preparation steps now have an explicit group role,
  making the accessible label supported by their semantics.
- Missing article excerpts previously fell back to entire source bodies. The
  migration now produces plain summaries of at most 300 characters, without
  duplicating or changing the complete article body.

Automated scans cannot assess whether every historical alternative description
is meaningful, whether pastoral copy is understandable, or how each page works
with an actual screen reader. Keyboard/menu/gallery flows are checked separately;
manual screen-reader, zoom and content review remain part of release review.
No blanket WCAG certification is claimed.

## Production preview results

The production build passed **12 accessibility cases / 13 axe scans**, including
the unavailable-image thumbnails and opened viewer, with **zero detected rule
violations**. Axe still marks some checks incomplete: contrast over photographs,
pseudo-elements or modal layers, and interpretation of decorative arrow glyphs.
These are recorded in the attachments for manual review rather than counted as
passes. The generic labelled baptism container found during that review was
corrected and its focused scan passed without the ARIA warning.

Six production-preview lab samples were captured at **14:21–14:22 UTC** using
Chrome **156.0.8078.79**, Node **22.23.4** and Next.js **16.4.3**. Desktop width
was 1440 pixels; mobile width was 390 pixels. Image requests include the initial
view and then the completed scroll through lazy-loaded content.

| Page / width          | LCP (ms) | CLS after scroll | DOM elements | Image requests: initial → scroll | Decoded images / fallbacks | JS (KiB) |
| --------------------- | -------: | ---------------: | -----------: | -------------------------------: | -------------------------: | -------: |
| Home / 1440           |      136 |                0 |          537 |                           8 → 16 |                     16 / 0 |      473 |
| Home / 390            |      108 |           0.0002 |          537 |                           7 → 16 |                     16 / 0 |      473 |
| Weekly bulletin / 390 |       92 |                0 |          560 |                            1 → 1 |                      1 / 0 |      471 |
| Archive article / 390 |       88 |                0 |          282 |                            3 → 4 |                      4 / 0 |      468 |
| Parish gallery / 390  |      124 |           0.0001 |          418 |                          14 → 36 |                     36 / 0 |      474 |
| Ľudové misie / 390    |       84 |           0.0002 |          378 |                           0 → 17 |                     14 / 3 |      468 |

All six returned HTTP 200, requested eight distinct JavaScript files, and had no
JavaScript errors, horizontal overflow, raw broken image elements, editor DOM,
or requested scripts containing the checked Tiptap/ProseMirror signatures.
The unavailable historical files remain an asset-recovery task; an explicit
fallback communicates their absence. These measurements preceded only the
nonvisual baptism group-role addition.

Machine-readable evidence is stored locally in ignored files:
`.private/performance/accessibility-production.json`,
`.private/performance/accessibility-baptism-semantic.json`,
`.private/performance/local-production.json` and
`.private/performance/local-production-missing-image.json`. The public scripts
and commands above reproduce the checks without committing environment data.

The deployed Preview also passed **19 read-only HTTP assertions** plus a mobile
login browser check. GET/HEAD admin-page requests on its unique deployment URL
and secondary alias redirect with HTTP 307 to the fixed Preview origin,
preserving the path and query. The fixed login returns HTTP 200 without a loop;
public home pages return HTTP 200. Authentication and admin APIs retain their
own HTTP 503 response while Google credentials are unconfigured, without a page
redirect. This verifies routing and the configuration notice, not a live Google
sign-in. Evidence is in ignored `.private/performance/preview-access.json` and
`deployed-admin-login-mobile.png` in the same directory.

## Measurement limits

The performance collector uses a new browser context per route, device scale 1,
and no CPU/network throttling. It measures initial rendering and a subsequent
scroll through the page, including lazy images and unavailable-image fallbacks.
The browser, app version, capture time and exact methods are stored in the JSON.
The local server and Cloudinary CDN cache state are uncontrolled.

LCP/CLS values here are individual lab samples, not field Core Web Vitals,
percentiles, a Lighthouse score, or a hosted performance guarantee. INP is not
measured. Cross-origin resource sizes may be hidden by Timing-Allow-Origin;
JavaScript byte counts are decoded bodies for unique requested scripts.

The editor separation check scans **scripts actually requested by the public
page**, including navigation prefetch, for ProseMirror/Tiptap runtime signatures.
It also checks for editor DOM nodes. Build output may contain admin editor chunks
without those chunks being requested by visitors. This distinction prevents a
misleading whole-build size claim.
