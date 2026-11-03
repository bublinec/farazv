# Codebase and application review — 3 November 2026

The current Next.js application is a suitable foundation for this parish. Keep the
stack and the separate draft/published model. The next substantial work should
make recovery, publishing accountability and access management more dependable.
A framework migration or generic CMS replacement is not justified by this review.

Reviewed from `a691942` on `review/codebase-hardening`. This report distinguishes
reproduced defects, code-level findings and unverified external configuration.
The legacy applications in `old/` were retained as historical sources, not audited
as applications to operate publicly. This is a focused engineering review, not an
exhaustive penetration test or accessibility certification.

## Scope and strengths

The active source has 218 TypeScript/TSX files. Inspection covered public routes
and metadata, rich-text/link validation, authentication and roles, HTTP boundaries,
editor state, publication/version handling, media verification, bulletin import,
feedback persistence, database configuration, caching and CI. Browser checks cover
public reading/navigation and authenticated editing using isolated fixtures.

The important existing safeguards should survive future refactors:

- Public queries select published snapshots and omit private drafts/provenance.
  Optimistic versions prevent silent concurrent overwrites; saving an already
  published record intentionally updates its public snapshot.
- Admin requests verify signed/encrypted Google identity and current roles.
  Editor grants are checked uncached; writes additionally require the configured
  origin. Private previews, feedback and access management have explicit boundaries.
- Rich text is parsed into allowed node/attribute types and rendered as React,
  rather than executing imported HTML. JSON-LD escapes script-closing content.
- Upload completion checks signed identity plus independently fetched Cloudinary
  metadata. Word import has byte, archive expansion, worker-memory and time limits.
  A worker thread is resource isolation, not a separate security principal.
- Publication cache failures are reported separately from committed writes;
  retrying cache refresh does not repeat a publication.
- Canonicals, Open Graph/Twitter metadata, structured data, sitemap, robots,
  legacy redirects, real 404s and preview/admin noindex already exist.
- Dates use Bratislava rules; public navigation refreshes time-sensitive content.
  Static-content baselines protect parish copy, credits and resource links.
- No new dependency, schema migration, live content edit or provider-setting change
  was needed for the fixes below.

## Fixed in this review

### Media pagination mixed search input with an older result cursor

**Moderate correctness issue.** In
[`useMediaLibrary.ts`](../src/components/admin/hooks/useMediaLibrary.ts), typing a
new search without submitting it and then selecting “Načítať ďalšie obrázky” sent
the new text with the old cursor. A failed replacement search caused the same
mismatch. The result could omit images or append unrelated search results.

The hook now remembers the query belonging to the last successful result. A
cursor always uses that query; a successful fresh search replaces it. Existing
request-version protection remains intact. A browser regression failed against
the original code and passes after the fix, covering unsent input, a failed new
search, successful replacement and subsequent pagination.

### JSON request handling accepted incorrect types and mishandled cleanup

**Low severity robustness issues.** [`http.ts`](../src/server/http.ts) accepted
`application/jsonp` and other prefix matches. The stream stayed locked after
reading, and a cancellation error could replace the intended oversized-body
error with an unexpected service failure.

The reader now compares the exact media type while accepting normal parameters,
releases its lock in `finally`, and prevents failed cancellation from replacing
or delaying the size-limit error. Regression tests reproduced all three defects
before the change. Existing UTF-8 byte accounting, caller-specific shape checks
and 400/413/415 responses are retained. No authentication bypass was demonstrated.

### Article covers caused a visible loading shift

**Moderate presentation/performance issue.** A cold mobile sample showed a 0.1659
cumulative layout-shift value on the fixture archive article. Inspection traced
most movement to the cover: CSS set both width and height to `auto`, leaving its
box at zero height until the image arrived.

Delayed-image regressions reproduced zero reserved height at 390 and 1440 pixels.
[`EditorialDetail`](../src/components/editorial/EditorialDetail.tsx) now supplies
the known original width to its cover CSS, which sets a definite width bounded by
the container and original dimensions. The existing height cap and `contain`
rendering remain. This reserves the HTML aspect ratio before image delivery and
does not enlarge small originals. Tests compare dimensions before/after delivery.

### Pagination accepted clicks before client startup

The release CI caught a timing failure in the failed-request/retry flow. A
controlled delayed-JavaScript regression then demonstrated that the server-rendered
“load more” button was enabled before its handlers were ready. That test failed
against the original component. [`EditorialFeed`](../src/components/editorial/EditorialFeed.tsx)
now keeps pagination disabled until its mount effect runs. Normal pagination,
delayed startup and failed-request retry all pass locally after this change;
the full release CI is rerun before merging. This improves actual slow-startup
behavior rather than adding test sleeps or weakening assertions.

### Operational documentation disagreed with actual authentication

The runbook and architecture said eight hours; `SESSION_MAX_AGE` actually specifies
**180 days**, with automatic refresh disabled. Both documents now describe the
implemented policy and revocation limits. Session behavior was deliberately not
changed as part of a documentation correction. The admin test runner's failure
message also now directs developers to an owned compiled server instead of telling
them to stop another development server.

## Prioritized remaining work

Priorities describe sequencing, not a claim that every item is a vulnerability.
Size is relative: S = focused configuration/change, M = coordinated feature,
L = several migrations or operational decisions.

| Priority | Work                                           | Why it matters                                                                                              | Size / owner                    |
| -------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------- |
| P1       | Scheduled database and original-media recovery | A working backup command does not establish automatic, recoverable backups.                                 | M / service owner + developer   |
| P1       | Content revisions and actor audit              | A mistaken save of published content cannot be undone from version history today.                           | M / developer + editors         |
| P1       | Review 180-day stateless sessions              | A copied valid cookie can outlive sign-out; there is no individual-token revocation store.                  | M / owner + developer           |
| P1       | Verify required checks before production       | Current workflows test and smoke-check, but the repository does not establish a production promotion gate.  | S–M / repository + Vercel owner |
| P2       | Separate public and admin layouts              | Admin/login requests unnecessarily depend on public settings and public shell construction.                 | M / developer                   |
| P2       | Monitoring and useful sanitized diagnostics    | Release smoke checks do not detect all later outages or explain partial-content failures.                   | M / operations + developer      |
| P2       | Editorial accessibility and content ownership  | Images lack a dedicated alternative-text workflow; fixed informational content still needs developer edits. | M–L / editors + developer       |

### 1. Recovery that someone else can operate

Existing backup/restore scripts and prior restore drills are useful. Automated
scheduling, offsite retention, failure alerts and access for an alternate operator
remain unconfirmed. Database backups contain media references, not Cloudinary
originals. The earlier inventory recorded 76 missing originals and five restricted
PDFs; this review does not recover them or grant publication permission.

Decide the acceptable data-loss window and recovery time, choose parish-controlled
storage, schedule encrypted backups, and give a second person recovery access.
**Acceptance:** restore into a separate empty database, compare published/draft
counts and representative assets, run the app against it, record duration and test
a backup-failure alert. Keep credentials outside Git. Use the existing
[backup runbook](operations.md#backup-and-restore) rather than introducing a second
set of recovery commands.

### 2. Revisions before more editors or larger content migrations

[`schema.ts`](../src/server/db/schema.ts) stores only the current draft, published
snapshot and optimistic version. A version counter detects conflicts; it does not
preserve older content. The record mutation routes receive an authenticated
identity through `adminResponse`, but do not pass it to `updateRecord`.

Add append-only revisions containing record ID, version, action, actor and the
relevant snapshots in the same transaction as the successful write. Include
settings, publish/unpublish and imports, with an explicit system/import actor.
Build a small history/restore screen; restoration must create a new version rather
than rewinding counters. Decide retention for private draft content.
**Acceptance:** concurrent failed writes create no revision, publication and audit
commit together, a previous version can be restored, and history stays private.
Backups remain necessary even after this feature.

### 3. Session lifetime and recovery policy

[`auth.ts`](../src/server/auth.ts) uses a fixed 180-day encrypted stateless cookie.
Current role checks block revoked editors immediately, and secret rotation ends
all sessions. Clearing the browser cookie on sign-out does not create a server-side
revocation record for a copied token. Regranting an editor role can make an
unexpired old identity usable again. Environment-configured administrators require
an allowlist change and redeployment to remove access.

Agree on a shorter identity lifetime or implement persistent, individually
revocable sessions, then consider fresh sign-in for access-management changes.
**Acceptance:** expired identity is rejected, a lost device can be revoked without
removing every editor, and revoke/regrant does not revive that device. Preserve
verified-email checks and existing fail-closed behavior. See the provider's
[session management documentation](https://better-auth.com/docs/concepts/session-management),
particularly the differences between stored and stateless sessions.

### 4. Release checks must precede user exposure

[`checks.yml`](../.github/workflows/checks.yml) runs on pushes and pull requests.
[`production-smoke.yml`](../.github/workflows/production-smoke.yml) reacts to successful
checks or deployment status. Neither file proves that Vercel waits for CI before
serving a main-branch deployment. Live branch-protection and Vercel promotion
settings were not inspected in this pass, so their absence is not asserted.

Verify protected-main rules with required checks and require a tested commit before
merge. Verify the production deployment uses that exact commit, including schema
compatibility; use staged promotion if the chosen account supports the required
workflow. Beware `paths-ignore` when configuring required workflows: documentation-only
pull requests must not wait forever for a check that never runs.
**Acceptance:** a deliberately failing test cannot reach production through the
normal release path; document the emergency rollback and migration procedure.

### 5. Public/admin layout separation

[`app/layout.tsx`](../src/app/layout.tsx) awaits public settings and constructs the
footer for every page. Client-side `SiteShell` later hides the public shell on
admin paths. Thus even the login page can wait on a failing public-settings query;
this is a code-path finding, not a measured production outage.

Keep a minimal common HTML root and put public navigation, footer, date refresh
and public data loading in a `(public)` layout. Leave admin under its own layout
and preserve all URLs, metadata and auth redirects. Next's
[route groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
allow layout grouping without changing URL paths. **Acceptance:** public routes
and canonicals are unchanged, login renders without a public-settings read, and
public pages do not gain editor runtime code. Do not broadly enable static caching:
Mass schedules, expiry and midnight/Saturday boundaries need explicit coverage.

### 6. Observability, privacy and platform maintenance

- Add external uptime alerts with a named recipient. `/api/health` checks database
  access; also check meaningful public content because a fallback page may be HTTP 200. Release smoke checks are not continuous monitoring.
- [`public-content.ts`](../src/server/public-content.ts) replaces underlying read
  failures with a generic error. Keep safe user messages, but add operation labels,
  request correlation and sanitized server diagnostics. Never log connection URLs,
  OAuth cookies, draft bodies or visitor feedback. Test redaction deliberately.
- Define feedback retention and deletion responsibilities before collecting more
  personal information. Current feedback is private and rate limited; its records
  have no age-based retention process. This needs an owner-approved policy.
- The previous release recorded a PostgreSQL SSL-mode deprecation warning. The
  installed `pg-connection-string` parser currently treats `require`/`prefer`/
  `verify-ca` as `verify-full` unless compatibility mode is enabled. Before upgrading
  this dependency, review the private connection configuration and use explicit
  intended certificate verification. Test against the provider; do not silence
  warnings by disabling certificate checks. No connection strings were changed.
- The current CSP covers frames, objects and base URLs, but has no `script-src`
  restriction. Stronger CSP is defense in depth, not a demonstrated XSS fix. Stage
  it in report-only mode with Next hydration, Google login, maps and analytics
  coverage before enforcement; avoid a blanket policy that breaks the app.

### 7. Content, accessibility and search operations

[`MediaPicker.tsx`](../src/components/admin/MediaPicker.tsx) assigns the record title
to selected image alt text. Existing tests deliberately expect that behavior.
Add separate alternative text and caption controls, with an explicit decorative
option where appropriate. Preserve contextual alt text per content occurrence
rather than changing every use of a shared asset. Acceptance should include a
screen-reader review, not just an automated axe result.

Static informational pages use preserved source data plus approved corrections
and layout metadata. Keep the raw provenance immutable. If parish staff need to
maintain these pages, first identify the few fields they should own, add validation
and revisions, and retain the reviewed public-content baseline. Do not introduce a
full page builder merely to change office hours or a contact.

Search Console ownership/submission remains unconfirmed. Verify parish-controlled
ownership, submit the existing sitemap and inspect indexing/field performance.
The code already supports verification; no fabricated token is needed. Confirm
live Google sign-in and a real weekly publishing cycle separately from test cookies.

## Measured performance follow-up

Local compiled-fixture samples used a cold browser context per route, no CPU or
network throttling, and real public image delivery. They are not field Core Web
Vitals, an INP measurement or a production performance guarantee. Server/CDN caches
were uncontrolled. All six samples returned HTTP 200, with no page errors,
horizontal overflow, failed-image fallbacks or detected editor-runtime scripts.

The contact page loaded **1,592,973 decoded JavaScript bytes**, compared with
**496,695** on the homepage. These are decoded script bodies, not compressed
network transfer sizes. [`ParishMap`](../src/components/information/ParishMap.tsx)
loads MapLibre on mount. Consider loading the map when it approaches the viewport,
or on deliberate activation while retaining the existing address/map link.
Measure a mobile connection before choosing the interaction. Keep this as a
separate change because it affects map availability and usability.

The sampled article's image-loading shift was fixed in this review: observed
cumulative layout shift fell from **0.1659 to 0.0369** in the follow-up mobile
sample. The deterministic delayed-image tests verify the actual sizing invariant
at both mobile and desktop widths. Font swapping can still cause smaller shifts; compare real visitor data before changing local
fonts or typography. The retained parish visual identity is intentional.

## Refactoring boundaries

The largest executable modules are `bulletin-parser.ts` (932 lines) and
`content-store.ts` (521 lines). Extract parser phases and their types only around
well-defined inputs/outputs, backed by a representative DOC/DOCX/TXT corpus including
ambiguous dates and malformed archives. Split content queries from commands when
adding revision transactions, keeping version checks and publication rules visible.

The larger admin forms and media dialog are reasonable feature boundaries today.
Extract focused form sections as new fields arrive; avoid generic form/state
frameworks. The 8,754-line `information-content.ts` is source data, not application
complexity to delete. Preserve generated data and independent approval fixtures.
For database growth, measure actual query plans before adding JSON expression
indexes or replacing the document model. No scale failure was demonstrated.

## Verification and limits

- Baseline checks passed before edits: 81 unit passes and one opt-in DB skip.
- Regressions were observed failing before fixes: JSON media-type/cleanup errors
  and media pagination using the wrong query.
- Updated formatting, types and unit tests: 83 pass, one opt-in DB skip.
- Fixture production build passed; isolated PostgreSQL integration: seven pass.
- Compiled authenticated admin browser suite: 18 pass, including media races,
  stale versions, visibility, imports, access, feedback and upload retry behavior.
- Final compiled public/navigation/static-content/SEO/accessibility suite: 44 pass
  and one opt-in historical-image-path skip. Live public Cloudinary delivery passed.
- The three affected admin preview/gallery tests were rerun after the cover sizing
  change and passed. The final production build also passed.
- Six local performance samples plus the affected article follow-up passed their
  runtime/image/overflow/editor-bundle invariants; mobile article rendering was
  visually inspected. Measurements are described above.
- External dependency audit was not performed: automatic approval review blocked
  sending dependency metadata to npm, and the owner subsequently chose to skip it.
  The earlier audit is historical evidence, not a fresh advisory result.
- Local fixtures and signed test cookies do not verify live Google OAuth, production
  backup scheduling, account recovery or remote provider configuration.

The review was prepared as focused fixes on a separate branch without live
configuration or database changes. The owner subsequently authorized merging it
to main, including a small contact-spacing follow-up. See the dated
[release record](remake/plan.md) for deployment and verification status. Larger
roadmap items remain separate work.
