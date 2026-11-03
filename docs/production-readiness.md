# Production readiness — 3 November 2026

Production: https://farazv.sk · [Operations](operations.md) · [Verification history](remake/plan.md)

The repository implements the technical SEO foundations and production controls below.
Release status and dated verification are recorded in the [plan](remake/plan.md).
Local and branch CI checks are separate from live production verification.
Search Console ownership, unattended backups and continuous alerting remain
unverified. The owner confirmed on 3 November that Search Console and automated
backups may not be configured. A successful deployment alone does not complete
those operational tasks.

## Technical SEO and application changes

| Area                   | Implemented state                                                                                                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search metadata        | Each public page has a title, description, canonical URL, Slovak language and Open Graph/Twitter metadata. A genuine church photograph supplies a fallback social image. Editorial pages use their own cover when present.                                                               |
| Structured data        | Homepage WebSite and parish Organization; editorial Article data, or WebPage for posters. Contact information comes from published settings. No invented ratings, event dates, authors or opening hours. JSON-LD escapes editorial HTML delimiters and is omitted from private previews. |
| Indexing               | Indexable only when `SITE_INDEXING_ENABLED=true`, `VERCEL_ENV=production` and `CONTENT_SOURCE=database`. Fixture/preview pages remain noindex; their sitemap is empty. Admin and API responses carry noindex headers.                                                                    |
| Sitemap                | Only public canonical destinations, deduplicated; redirected news URLs are omitted. `lastmod` uses the timestamp of the published snapshot, not a private draft edit. Static pages omit guessed modification dates.                                                                      |
| Domain consolidation   | WWW already redirects to the apex. Public GET/HEAD visits on production deployment aliases now redirect permanently to `SITE_URL`, preserving path/query. Preview deployments stay usable. Existing admin-origin and API protections remain.                                             |
| Legacy URLs and 404s   | Existing gallery, tour, confirmation and CMS redirects retained; `/prispevky` now redirects permanently to the homepage noticeboard. Unknown pages return a real 404.                                                                                                                    |
| Resilience and headers | Root error fallback with retry/contact, anti-framing header, nosniff, referrer/permissions policies and existing CSP. Database health endpoint is uncached.                                                                                                                              |
| Accessibility          | Admin brand link derives its accessible name from the visible parish/city text. Existing keyboard, mobile-navigation and image-fallback checks retained.                                                                                                                                 |
| Release checks         | New SEO browser coverage and `npm run verify:production`. GitHub runs a public health/SEO smoke check after successful main-branch CI or Production deployments, with manual dispatch available.                                                                                         |

The metadata helper adds no new browser dependency. Existing local fonts,
responsive Cloudinary images, manifest/icons, server-rendered content, authorized
editor writes, same-origin checks and feedback rate limiting remain in use.
The production dependency audit reported zero known vulnerabilities during this
pass; that is a point-in-time result, not a guarantee about future advisories.

The regression suite has also been reconciled with previously shipped changes:
merged church/gallery routes, magazine pagination, inline admin preview, a
visibility switch and saving changes directly to already-published records.
Private unpublished records remain private. Original raw source records are
unchanged; the separate owner-requested choir correction has its own reviewed
content-baseline update.

## Remaining owner setup

### 1. Google Search Console

1. Open [Search Console](https://search.google.com/search-console) using the
   account that should retain parish ownership, and add the **Domain** property
   `farazv.sk`.
2. Copy Google's verification TXT value and add it to the apex DNS zone in
   **Vercel**, where the authoritative DNS is now managed. FORPSI remains the
   registrar; it does not need another nameserver change.
3. Complete verification, then submit `https://farazv.sk/sitemap.xml` and inspect
   the homepage and one article. Review indexing errors and Core Web Vitals as
   data becomes available.
4. Add a second trusted owner so recovery does not depend on one personal account.

See Google's [ownership verification instructions](https://support.google.com/webmasters/answer/9008080).

An alternative is a URL-prefix property for `https://farazv.sk/` using Google's
HTML-tag token. The app supports `GOOGLE_SITE_VERIFICATION`: enter only the
`content` token as a Production environment variable, redeploy, then verify.
No Google-issued verification value was available during this implementation,
so no property or token is claimed to be configured. Verification/submission does
not guarantee indexing or ranking.

### 2. Automated recovery

The repository already has restricted-file `db:backup`/`db:restore` tools and
recorded successful local and hosted archive restore drills. These are **not an
automated backup service**. See [the backup runbook](operations.md#backup-and-restore).

Select a parish-controlled encrypted storage destination and recovery operator.
Configure a scheduled runner with a private direct database connection and
PostgreSQL clients compatible with the hosted server. Proposed policy: daily
backups plus pre-migration backups, 30 daily and 12 monthly copies, failure alerts,
and quarterly restore drills into a separate empty database. Confirm retention
and access before activating the schedule. Keep the encryption recovery key
separately accessible to the alternate owner.

Cloudinary references in a database archive do not back up image/PDF bytes.
Confirm the media account's original-file backup/export arrangement separately.
The previous migration audit recorded 76 missing originals and five restricted
PDFs; this SEO pass does not recover or republish them. See
[the media recovery evidence](migration.md#verification-and-release-limits).

### 3. Monitoring, account access and real editor acceptance

- Configure an external uptime check for the homepage and `/api/health`, with an
  alert recipient and a documented response owner. The deployment smoke workflow
  runs after releases; it does not detect every later outage.
- Review Vercel, Neon and Cloudinary usage/error notifications and current plan
  suitability in their dashboards. No paid plans or billing changes were made.
- Perform one real Google sign-in at `/admin`, sign-out and fresh sign-in, then
  an agreed editorial publishing cycle. The production callback was confirmed
  registered; local tests use signed test sessions and cannot prove Google login.
- Verify current recurring Mass times and final source freshness with the parish;
  preserve the old services until a real weekly cycle succeeds. The imported
  recurring template and historical source checks have documented limits.
- Keep registrar, Vercel, database, Google and media recovery access in the parish's
  password manager with an alternate owner. Complete manual mobile/keyboard and
  content review; automated accessibility tests are not full accessibility certification.

## Repeatable verification

```sh
npm run check
npm run build
npm run test:integration
ADMIN_E2E_SERVER=production npm run test:admin
npm run verify:production
npm run verify:production -- --all-pages
```

Public browser checks include `tests/browser/seo.spec.ts` alongside navigation,
reading-content and accessibility coverage. Follow the isolated-server guidance
in [README](../README.md#checks); integration/admin tests create their own local
databases. The live production verifier performs only public read requests and
checks metadata, canonical destinations, sitemap, robots, health, 404s, admin
noindex and legacy redirects. `--all-pages` checks every sitemap URL with a
maximum of three simultaneous page requests.

Dated test and deployment outcomes are recorded in [the plan](remake/plan.md).
DNS caches may temporarily serve the former host during migration; distinguish
registry delegation, normal resolution and direct Vercel-origin checks.

## Reference decisions

Google recommends accurate significant-change dates in sitemaps; private draft
saves must not manufacture public changes. See [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
Canonical URLs and permanent redirects consolidate duplicate production hosts;
see [canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
The structured data follows Google's [site-name](https://developers.google.com/search/docs/appearance/site-names)
and [article](https://developers.google.com/search/docs/appearance/structured-data/article)
guidance. Page metadata uses [Next.js metadata conventions](https://nextjs.org/docs/app/getting-started/metadata-and-og-images).
