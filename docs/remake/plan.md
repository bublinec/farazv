# Implementation plan and progress

[Overview](README.md) · [Architecture](architecture.md) · [Decision log](decisions.md)

## Current status — 3 November 2026

The application now runs from the repository root and is live at
[farazv.sk](https://farazv.sk/). Release `a691942` was merged to main and deployed.
The original migration-stage descriptions below are historical; their references
to `remake/`, a pending domain cutover and an unchanged legacy deployment are not
current operating instructions. Use the [root README](../../README.md) and
[operations runbook](../operations.md) for setup and recovery. The new
[codebase review](../codebase-review-2026-11-03.md) records remaining priorities and
focused fixes on a separate branch; it does not authorize production deployment.

## Historical migration brief

The user authorized completing all remaining work in one run. The four stages
remain the implementation/review structure; earlier instructions to pause after
each checkpoint are superseded. Review records and honest verification still
matter. A protected hosted preview and Neon import are now available; live Google
OAuth, source freshness, ongoing backup operations and production cutover remain separate.

## Original four-stage plan

| Stage                           | Implemented deliverables                                                                                                                                                                       | Review record / outstanding work                                                                                                                                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Foundation and public design | Pinned Next.js app, shared design, responsive public routes, navigation, bulletin, gallery and editorial shell                                                                                 | Public browser flows passed; parish/design acceptance remains a human review, without blocking the authorized implementation sequence                                                                                                  |
| 2. Admin and publishing         | PostgreSQL/Drizzle, Google allowlist guards, visual editor, media picker/uploads, settings, private preview, atomic draft/public workflows and public database reads                           | Five database integration tests, 14 admin flows and an additional mobile bulletin-category flow passed; live Google callback still requires credentials                                                                                |
| 3. Complete migration           | 414 content records, all 146 articles public, 1,081 media records, 30 static provenance records, full published informational copy, anomaly/body/category reconciliation and repeatable import | Final excerpt correction: 179 updated, 235 unchanged, zero conflicts in local/hosted imports; source freshness and 76 missing originals remain unresolved                                                                              |
| 4. Release and cutover          | Protected Vercel preview, verified hosted Neon import, SEO controls, CI, local/hosted backup/restore drills, operations/editor guides and rollback procedure                                   | Final build, real-data accessibility/routes/privacy/pagination and cold-outage checks passed; Google, source freshness and production acceptance remain. Live farazv.sk and legacy stack unchanged; no DNS switch or legacy retirement |

The application remains in `remake/`; Vercel's configured root directory removes
any need to move the repository root during this run. Preserve Gatsby and user
files until a deliberate later cleanup/cutover.

## Review findings

| Finding                                 | Implemented resolution / remaining evidence                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug overlaps and incomplete drafts     | Route-family unique index, reserved published paths, private incomplete drafts and publication validation                                  |
| Poster/news ambiguity                   | Placement, destination, expiry and news visibility share the authored record; public status stays separate                                 |
| Alternate flat/section article content  | Ordered sections retained, duplicate text suppressed and meaningful missing images appended; private provenance retained                   |
| Shared facts and hero controls          | Single settings source, Náuky/contact notes, bounded day controls, selected-day labels and midnight refresh                                |
| Save/read failures and concurrency      | Draft isolation, atomic versions, retained forms, explicit unavailable states and separate cache-refresh retry                             |
| Donation fidelity and anomalous history | Source categories/order retained, blank structural containers omitted, unnamed amounts preserved; nine invalid/duplicate weeks quarantined |
| Operations and indexing                 | Private auth boundaries, default noindex, clean isolated test runners, backup/restore and access recovery runbooks                         |

These corrections are implemented in the selected stack. Outstanding live service
and content-recovery work is listed below, rather than treated as a reason to add
a larger CMS, role system or unrelated service.

## Migration checks

- The allowlisted parser excludes source auth/configuration and reconstructs
  content without executing the dump. Counts reconcile with the [inventory](README.md#audited-source-inventory).
- All 146 articles are public; 86 unpublished news posts remain private. Source
  status/timestamps/hashes remain available as provenance. Static export includes
  only 29 published source pages; the remaining static source is private.
- Repeat imports preserve target edits, report conflicts/removals and reject a
  changed already-published path. The earlier repeat reported 414 unchanged; the final excerpt correction updated
  179 records, left 235 unchanged and reported no conflicts in both databases.
  All 146 article excerpts are plain text, 25–300 characters, with canonical
  article bodies unchanged.
- Canonical rich text preserves supported marks, ordered sections, captions,
  galleries and safe link fallbacks. Article sources 2–5 have explicit alternate-
  body reconciliation. Incomplete news sources 151/155 are retained privately.
- All fixed routes and dynamic families remain mapped; four legacy redirects and
  true 404 behavior have implementation/browser coverage. See [route details](../routes.md).
- Of 162 source bulletins, 153 valid weeks remain editable and nine anomalous or
  duplicate weeks are read-only/ineligible. Dates/intentions are not silently
  repaired. Empty structural donation containers are omitted; real categories,
  names/amounts and unnamed amounts remain.
- Media references remain intact. Availability/recovery evidence is private;
  76 originals remain missing and five unreferenced PDFs remain restricted.
  No recovery copy was found locally or through the read-only account checks.
- Published static reading copy and collections replace shortened design samples.
  Dated source passages retain their original wording and visibility; contacts, current parish facts and
  the empty recurring template still need parish confirmation.
- Public resource checks and the withheld tour-link finding are documented.
  Readability does not establish that a form/course is current or owned.

## Verification record

Latest completed checks at this documentation update:

| Check                       | Recorded result                                                                                                                                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit/security suite         | Detail pass: 75 passed; one opt-in database suite skipped by the ordinary command (76 total)                                                                                                                                                                            |
| Real PostgreSQL integration | Refactor: seven passed (parent plus six contracts) in an owned disposable local database, including deterministic save/publish and same-ID insert races                                                                                                                 |
| Admin browser suite         | Refactor: 17/17 passed against an owned compiled server/disposable database; dirty preview/unpublish/sign-out, stale media search and completion-only upload retry included                                                                                             |
| Public browser suite        | Detail pass: 18/18 public/design/static cases, including 24 static routes/224 reviewed reading blocks; 8/8 detail flows, then 3/3 affected follow-ups. Earlier refactor collection paging/focus/wrapping also passed                                                    |
| Production build            | Final detail pass: integrated production build, TypeScript and formatting passed                                                                                                                                                                                        |
| Accessibility               | Detail pass: 11 fixture cases passed, one optional missing-image case skipped; extra history/marriage scans passed. Earlier refactor: 12/12 real-data cases (13 scans), including missing-image states. Manual review remains separate                                  |
| Public route/privacy checks | 146 articles, six news, one notice, one event and 28 positive fixed/listing paths returned 200; four redirects and six unknown/history checks passed                                                                                                                    |
| Private routes              | 84 private news slugs, nine private notices and two private events returned 404; two other private news records have no public slug                                                                                                                                     |
| Magazine pagination         | 146 unique summaries in 24 requests; ten initially, up to six thereafter, without bodies/draft/provenance fields                                                                                                                                                        |
| Cold database outage        | Public shell remained 200; data/health APIs returned 503; details showed unavailable state rather than false 404                                                                                                                                                        |
| Hosted import               | Free Frankfurt Neon PostgreSQL 18.6 provisioned; 414 content, 1,081 media and 30 static provenance counts verified against local                                                                                                                                        |
| Hosted smoke                | Authenticated read-only check passed: health 200, all 146 summaries in 24 requests without bodies, robots disallow and four mobile pages without runtime errors/overflow; editor OAuth not verified                                                                     |
| Excerpt correction          | Local and hosted projections: 179 updated, 235 unchanged, zero conflicts; all 146 magazine excerpts plain text, 25–300 characters, canonical article bodies unchanged                                                                                                   |
| Backup/restore              | Local PostgreSQL 14: five tables/1,527 rows matched. Hosted PostgreSQL 18: five tables/1,530 rows plus schema/index/sequence hashes matched; source unchanged, source/nonempty-target guards passed, only temporary target removed. Off-device automation not activated |
| Live Cloudinary             | Real signed upload, independent metadata lookup, completion validation and temporary-asset cleanup passed                                                                                                                                                               |
| Cleanup behavior            | Tracked runners removed owned processes/databases; SIGTERM cleanup verified                                                                                                                                                                                             |
| CI definition               | YAML/pins reviewed; workflow has no production secrets or deployment step. Hosted CI execution is not claimed                                                                                                                                                           |
| Local performance           | Six unthrottled production samples: LCP 84–136 ms, CLS 0–0.0002; eight JavaScript files/468–474 KiB decoded, no requested editor runtime, runtime errors, overflow or raw broken images. Local only; [methods/limits](../quality-audit.md)               |

Admin browser cookies use the real Better Auth format with test-only local
provider fields. They do not verify live Google OAuth. The Cloudinary live smoke
is separate from the mocked upload UI test. Historical build/test evidence below
is retained as history and is not a substitute for the final integrated checks.

## Remaining release work

1. Complete hosted end-to-end acceptance and manual accessibility/content
   review. Local lab measurements are recorded; assess hosted behavior separately.
2. Configure absent Google OAuth credentials, register exact fixed callback URLs,
   verify permitted/rejected accounts and access recovery on staging.
3. Obtain/reconcile an authorized fresh private export and editing freeze for
   launch. The authorized read-only legacy check timed out without results or
   changes, so it did not establish source freshness.
4. Resolve missing-original recovery or explicitly document the owner's accepted
   remaining media limitations. Do not bypass the PDFs' restrictions or send the
   private support CSV without authorization.
5. Confirm current contacts, dated arrangements, donor presentation and recurring
   Mass times with the parish. Activate actual ongoing backups/retention and
   assign recovery ownership; the runbook's proposed schedule is not running yet.
6. Accept the protected preview, then deploy the verified production app/data
   configuration, verify the real domain and intentionally enable indexing/cut
   over. The preview is deployed; live farazv.sk, its legacy stack and DNS are unchanged. Keep old services through a successful real weekly publishing
   cycle, with rollback covering edits made in the new admin.

## Progress log

### 2026-10-31 — Discovery, plan and first public implementation

Counted the private snapshot as data, recorded source-backed review corrections,
and created the four durable records. Implemented the isolated public foundation
with explicit public samples and synthetic schedules. Its 19 unit tests, 13
browser tests, build and 55 route smoke checks passed at that stage. The earlier
stage-1 review pause was subsequently superseded by the user's request to
implement the rest in one run.

### 2026-10-31 — Integrated admin, persistence and migration

Implemented the guarded editor/admin, canonical Tiptap content, signed uploads,
versioned draft/public writes, public database reads and shared settings. Imported
414 content records, 1,081 media records and 30 static provenance records. All
146 magazine articles are public; other source statuses remain preserved. Full
published reading copy/collections and credits now use the custom layouts.
Reconciled route families, incomplete drafts, alternate bodies, donation
categories and nine historical anomalies. Before the final excerpt correction,
repeat import reported 414 unchanged,
zero mutations. Recurring times remain unconfirmed/empty rather than fabricated.

### 2026-10-31 — Recovery, verification and hosted preparation

Added isolated database/admin runners and pinned CI, completed the local
backup/restore rehearsal and verified a real temporary Cloudinary upload through
completion and cleanup. The media audit confirmed 76 missing originals and five
restricted unreferenced PDFs; recovery evidence/support CSV remains private and
unsent. Initially linked the new Vercel project with `remake/` and Node 22 before
deploying. Google credentials remain absent. The user accepted Neon terms
and explicitly approved the previously denied read-only legacy freshness check.
The subsequent hosting/check outcomes are recorded below. Final build and
53 unit tests passed, alongside the separately recorded database/admin/public
flows.

### 2026-10-31 — Hosted preview and final verification

Provisioned free Frankfurt Neon PostgreSQL 18.6 and verified the hosted import
against local: 414 content, 1,081 media and 30 static provenance records. Deployed
a protected [stable Vercel preview](https://farazv-preview-bublinecs-projects.vercel.app)
with an additional `farazv.vercel.app` alias. Both aliases target the explicit
Preview environment. The first manual deployment defaulted to an unconfigured
Production environment on the new project; it did not change live `farazv.sk`,
the legacy stack or DNS. Hosted health returned 200; robots disallows crawling.
The authorized read-only legacy freshness check timed out without results or
changes; a fresh private export/reconciliation and editing freeze remain required.

Eleven real-data axe scans passed. Local production route checks returned 200
for every published article/news/notice/event and all 28 positive fixed/listing
paths, rejected private content, and passed redirects/unknown-path checks.
Pagination returned 146 distinct summaries in 24 requests without bodies.
The cold-database outage test preserved a usable shell and explicit unavailable
states. The 14 admin flows and an
additional mobile categorized-donation flow passed. Detailed scope is in the
verification table and [route record](../routes.md#local-verification-record).
At that point Google credentials remained absent and the hosted restore drill
was outstanding; the successful subsequent drill is recorded below. Local lab performance evidence
belongs in the [quality audit](../quality-audit.md).

### 2026-10-31 — Canonical admin entry across preview aliases

Found that an alternate alias could open admin while its relative sign-in API
still faced the fixed auth origin's strict checks. Added a Vercel-only server
proxy for GET/HEAD `/admin` pages, preserving path/query on the configured HTTPS
origin. APIs, mutations and trusted-origin checks are unchanged. Seven new
helper/proxy cases passed; the targeted auth/upload run passed all 15 tests and
typechecking passed. The final replacement deployment passed 19 read-only HTTP
assertions and a mobile login-page check across the unique, secondary and stable
hosts: exact GET/HEAD path/query redirects, canonical login 200 without loops,
unchanged API rejection and public home access. These checks do not establish
live Google OAuth.

### 2026-10-31 — Bounded excerpt correction and hosted read checks

Corrected a source lead that could become a complete/Markdown article excerpt.
The final projection updated 179 records and left 235 unchanged with no conflicts
in both the local and hosted databases. All 146 magazine excerpts are plain text,
25–300 characters, and canonical article bodies are unchanged. This supersedes
the earlier zero-change import result for the corrected projection.

The authenticated read-only Vercel smoke passed health, all 146 summaries in
24 requests without bodies, robots disallow and four mobile pages without
runtime errors or horizontal overflow. A focused missing-image grid/viewer axe
check passed. These checks are distinct from Google editor sign-in, which still
requires missing credentials. The canonical admin proxy is integrated; the
replacement-preview and recovery outcomes are recorded in their dated entries.

### 2026-10-31 — Hosted PostgreSQL recovery and final build

The final integrated typecheck/build passed, with 61 unit/security tests passing
and one opt-in database suite skipped (62 total). Rehearsed hosted recovery with
PostgreSQL 18 clients: a private 0600 archive restored into a separate empty
owned database, matching five tables/1,530 rows and schema/index/sequence hashes.
Source before/after hashes were unchanged; source and nonempty-target guards
passed. Only the temporary recovery database was dropped, with its absence
verified. This closes the hosted restore-drill gap, while ongoing encrypted
off-device backup scheduling, retention and ownership remain unactivated.

A replacement explicit Preview deployment passed its canonical-routing checks
under the same stable aliases. Google credentials are still absent; fresh source/freeze, missing
originals and actual recurring-time confirmation remain release requirements.

### 2026-10-31 — Final accessibility and local production measurements

All 12 real-database accessibility cases passed, including missing-image grid
and viewer states; a targeted semantic-group follow-up passed after its final
adjustment. Six unthrottled local production samples recorded LCP 84–136 ms and
CLS 0–0.0002, with eight JavaScript files/468–474 KiB decoded. None requested the
editor runtime or showed runtime errors, overflow or raw broken images. A
representative missing-image page decoded 14 images and showed three explicit
fallbacks. These local samples are not hosted field Core Web Vitals; exact
methods and limits are in the [quality audit](../quality-audit.md).

The reviewed explicit Preview deployment and both stable aliases passed their
19 read-only canonical-routing checks and mobile login-page check. Google
credentials remain missing, so fail-closed API behavior is expected and real
Google editor login is still unverified.

The complete final public browser suite passed **13/13** in 10.1 seconds against
an owned, isolated compiled fixture-production server. The final compiled
real-database baptism follow-up passed **1/1** after the semantic-group correction.
The final local build passed. These replace the earlier partial public-run
evidence; no application changes were needed for the final isolated test run.

The final hosted check found pre-import data still cached after deployment.
An explicit project data-cache purge resolved it: all 146 distinct summaries
across 24 requests were bounded to 300 characters, without private fields;
health returned 200 and robots continued to disallow indexing. The migration
runbook now requires this refresh after direct imports.

### 2026-10-31 — Static content fidelity clarification

The user explicitly limited static changes to presentation and gentle headings/
introductory descriptions. Audited all 24 old and local static routes, the legacy
renderers and SQL reading sections. Corrected the baptism-time substitution,
added archive labels, invented placeholder copy, exposed legacy SEO/editor notes
and omitted gallery attribution text. All 230 expected reading blocks are present
in the remake. See the [review record](../static-content-review.md);
this instruction supersedes earlier static-copy presentation assumptions.

### 2026-10-31 — Implementation review and proposed refactor

Completed a read-only review of UI, server contracts, persistence, migration,
tooling and instructions. The [refactor plan](refactor-plan.md) prioritizes atomic
import conflict protection, production/demo separation, portable content fidelity,
typed records, simpler validation, focused editor/media operations and readable
code organization. It includes whitespace conventions, staged exit checks and
explicit boundaries. Application changes remain proposed; this review changed
documentation only and did not rerun application tests or deploy.

### 2026-10-31 — Maintainability refactor implemented

Completed [the reviewed refactor](refactor-plan.md#completion-record) after the
user requested implementation. The importer now compares observed versions in
SQL; deterministic local PostgreSQL tests cover concurrent editor saves,
publication and same-ID inserts without sleeps. Conflicting records remain
untouched while unrelated records continue, with accurate outcome counts. New
settings start blank and cannot publish incomplete; existing data was not migrated.

Correlated record/document contracts, exhaustive forms/previews, family validation,
focused editor/media/navigation/upload hooks, separate public/media persistence
and CLI-only import ownership make routine changes easier to locate. Shared
JSON/body headers, publication invalidation and lazy CLI configuration retain
existing operation boundaries. Permanent photos are separate from synthetic demos;
static routes explicitly require their approved source or curated fallback.
The audited SQL parser/builder remain recognizable; no generic framework or
schema migration was introduced.

Verification after integration:

- `npm run check` passed: pinned formatting, Next route generation, TypeScript,
  69 unit/security tests and one intentionally skipped database suite (70 total).
- Production build passed. Seven real-PostgreSQL tests (parent plus six contracts)
  passed in a newly created disposable loopback database.
- Admin browser suite passed **17/17** in 23.4 seconds against an owned compiled
  server/disposable database, including three new state/navigation regressions.
- Public browser suite passed **15/15** in 15.0 seconds against an owned compiled
  fixture server. The independent snapshot and rendered checks preserve all
  **29 published records, 24 layout definitions and 230 reading blocks**, including
  original ordering, media, quotations, credits and resource destinations.
- Static generator check and alternate-output comparison were byte-identical to
  the committed export. The generator cannot update the independent baseline.
- Real imported-content accessibility passed **12/12** cases (13 axe scans) in
  15.0 seconds. A separate read-only 14-image editorial-viewer check passed edge
  clamping, disabled controls, focus return, Escape/Tab, reopening, scroll restore
  and accessible missing-image behavior with no runtime errors.
- Read-only local route/privacy checks passed all 146 articles, six news, one
  notice, one event and 28 positive fixed/listing paths; four redirects and six
  unknown/history checks. Private news/notices/events remained private; two
  slugless news records failed closed at the unconfigured admin boundary.
  Pagination returned all 146 unique summaries in 24 requests without private
  fields or article bodies, ten initially and up to six thereafter.
- Documentation file links and the nonignored source/secret boundary were reviewed.
  Owned verification servers/databases were cleaned up; the existing development
  server was left running.

No hosted import, live upload, service provisioning, deployment or DNS change was
performed for this refactor. Earlier hosted/provider evidence remains historical;
Google OAuth, source freshness, media recovery and launch requirements are unchanged.

### 2026-10-31 — Parish character design comparison

The user asked to preserve a familiar, church-loving parish feel and reduce the
sterility of the first design. Saved v1 before editing: sanitized 68-file public
presentation archive with SHA-256 manifest and six desktop/mobile captures. Built
an opt-in v2 using the same content/routes, warmer ivory/blue/gold, genuine church
details, the legacy illustrated tower and Source Serif headings/reading paired
with Ubuntu controls. V1 remains the default; selectors are nonproduction only.

[The design analysis](design-direction.md) explains the font choice, image roles,
unchanged content, practical task priorities and code owners. Both designs have
[saved visual records](design-history/README.md). The final local comparison runs
on owned port3103; the existing user development server on3100 was left running.

Fast check/build passed with 71 unit/security tests and one opt-in DB skip. The
13 public flows passed in v2; the final v1 public + selector/isolation run passed
16/16. V2 axe/static checks passed 13 cases (11 accessibility, two content/gallery),
with one optional historical-image case skipped because no migrated-data path
was supplied. All 29 published static records, 24 layouts and 230 reading blocks
remain protected. All six final v2 captures returned 200 with correct variant/
headings, all images loaded, no horizontal overflow and no runtime errors. A
selector host mismatch found during browser verification was fixed using relative
Location headers; final switching and return-path checks passed. Detailed scope
is in [the v2 record](design-history/v2/README.md).

No content database, hosted preview, live uploads or production deployment was
changed. Choosing a permanent default remains a design review after comparison.

### 2026-10-31 — Detail pass and reviewed expiry cleanup

The user authorized clearer layout/details and updates to expired deadlines,
meetings and courses. Implemented [the four-page refresh](content-refresh-2026-10-31.md):
remove old confirmation/preparation timetables, completed 2026 marriage courses,
the June family-day poster/form, and the stale school welcome/current pupil count.
Keep history, teaching, recurring arrangements and credits. New dates are not
invented. All 29 raw source records remain intact; current reading is 224 blocks,
with 219 unchanged and five refreshed. One expired resource link was removed.

The refined v2 prioritizes notices/news before the church welcome, gives section
shortcuts, clear today/selected status, larger mobile targets, practical sacrament
actions and accessible long-page topic navigation. Reading width, chapter spacing,
mobile paragraph size and subsection headings were refined. Source corrections
are explicit guarded projections so a new source timetable cannot silently be
removed by an old expiry correction.

Build/typecheck/formatting passed, with 75 unit/security checks and one opt-in
DB skip. The public/design/static run passed 18/18; the detail suite passed 8/8,
then the three affected flows passed again after final spacing/shortcut fixes.
Eleven fixture accessibility cases passed with one optional historical-image case
skipped; extra history desktop/mobile and marriage mobile scans had no WCAG A/AA
violations. Five homepage widths, exact eight-day order and 44 px targets passed.
Final information measurements confirm 28 px chapter gaps, 44 px topic links and
working focus destinations. Screenshots and evidence live in
[the refined v2 record](design-history/v2-refined/README.md).

The application remains local for review; no hosted content/import/upload,
Google setup, deployment or DNS change was performed. Prior visual records remain
preserved; no production cutover is implied.

### 2026-10-31 — Current-state review and source checkpoint

Reviewed current code, Git state, workflow and existing verification without
rerunning application suites. The [assessment](current-state-2026-10-31.md)
prioritizes a selected design, reproducible staging candidate, live editor
workflow, current source/parish facts, media acceptance and activated recovery.
Read-only Vercel CLI metadata confirmed the fixed preview alias targets a READY
deployment; this is not evidence that it contains the later local changes.

The user then requested commits. Implementation checkpoint `797b46c` records the
isolated remake, tests, workflow and ignore rules. Planning/design records are
committed separately. Credentials, private data, `farazv-admin/` and the original
brief remain excluded. Formatting and scoped staged-file checks passed; the
upstream font licence is preserved verbatim, including its one whitespace-only
warning. No push, provider mutation, deployment or DNS change was performed.

### 2026-10-31 — V2 composition with the original homepage hero

The user accepts v2 overall and requests the original v1 homepage hero. Restore
the shared full-width church photograph, dark overlay, centered schedule/cards
and Ubuntu title; retain date/today semantics, Sunday–Sunday ordering and minimum
44 px controls. The warmer masthead, serif reading, church accents and detail
refinements remain. [D30](decisions.md#d30--keep-v2-with-the-original-homepage-hero-31-october-2026)
records the choice and superseded split-hero experiment.

The fast check passed: formatting, route generation, TypeScript and 75
unit/security cases, with one opt-in database suite skipped. The production build
and 14 focused browser checks passed, including two homepage accessibility scans.
Hero measurements match between v1 and v2 at five widths; both final home captures
load all 21 images without runtime errors or overflow. See
[the current visual record](design-history/v2-original-hero/README.md).
The existing v1/v2/refined snapshots remain immutable; no production default,
deployment, content or provider configuration was changed.

### 2026-10-31 — Restore familiar page photographs and sacrament sections

The user supplied original screenshots and requested the page-specific church
detail photographs and six-sacrament section. V2 now uses the original source
covers across public page headers, with five explicit stock/illustration
replacements from the real church gallery and supplementary real photographs for
the news list and curated discovery page. The original homepage `window.png`
banner, six unchanged public summaries, gold links and responsive columns are
restored. No photographer is inferred for that precomposed banner asset.

All six sacrament pages present their existing catechism quotation and attribution
exactly once in a full-width pale-blue band directly below the hero. Reading
destinations and source order remain; all 29 raw records, 24 layouts and 224
approved reading blocks are unchanged. The shared original homepage hero, warm
masthead and serif reading continue. V1 and earlier visual records remain
preserved. [D31](decisions.md#d31--restore-page-photographs-and-sacrament-bands-31-october-2026)
records this refinement.

Verification is pending integration. Record formatting/type/build, source-content
and browser checks, representative desktop/mobile crops and accessibility results
here after they complete. No commit, hosted import, upload, deployment or DNS
change is part of this pass.

### 2026-11-02 — Verify visitor analytics and remove the admin statistics link

Read-only Vercel CLI checks confirmed that `farazv.vercel.app` now targets a
READY Production deployment of `ec7dd6b`, superseding the earlier preview-alias
description for that hostname. Web Analytics is enabled and the project API
reports `hasData: true`. Both the public insights script and the configured
generated script returned 200. An isolated browser loaded the configured script
without console errors; its headless/WebDriver exclusion intentionally prevented
an automated page-view submission. No synthetic analytics event was sent.

The existing package, Next integration, production gate and public-path privacy
filter need no change. Removed the external “Štatistiky ↗” link from the admin
navigation as requested. This source change has not been deployed.

Verification: the edited TSX file passes Prettier, TypeScript passes, and
`git diff --check` passes. The ordinary formatting command also scans ignored
generated `.next-preview` output and fails there. The unit suite has 73 passes,
one opt-in database skip and three failures in the unchanged information-content
tests (`information-updates.test.ts` and `information.test.ts`). No content,
provider settings, deployment or DNS changes were made during this check.

### 2026-11-02 — Restore the altar donation section without its legacy article

The homepage appeal depended on the presence of a published legacy news article,
although it used none of that article's content. The hosted detail destination
returned 404 when the article was absent. Removed that visibility gate and the
homepage's unnecessary article query. The permanent appeal now always renders
from its existing approved content; its detail page keeps the donation details
available, displays a letter only when published, and reports letter-read errors
without hiding the appeal. Existing St. Joseph wording, photographs, goal and
dedicated account remain unchanged; no draft content is made public.

The production build, TypeScript, scoped Prettier and diff checks passed. Six browser cases passed at
1440 px and 390 px with an absent published article, a published test letter and
a database outage. Each returned 200 for home and detail, showed the appeal,
copied the expected IBAN, kept private draft text out of HTML, and had no runtime
errors or horizontal overflow. Screenshots were visually checked. Tests used
owned processes and disposable local PostgreSQL databases, all cleaned up;
hosted data and provider settings were not changed.

### 2026-11-02 — Preserve the complete altar appeal on its detailed page

The user supplied the complete “Poďakovanie a forma pomoci” letter for permanent
public display, including Jozef Kraus's signature. The detailed restoration page
now renders that approved text from [the restoration content](../../src/content/altar-restoration.ts)
with paragraph breaks and the existing donation sidebar. It no longer depends
on a legacy article being published or available. The homepage appeal and its
detail link remain unchanged; database records and raw source content are untouched.

The production build (including TypeScript), scoped formatting and diff checks
passed. Browser verification at 1440 px and 390 px matched the entire rendered
letter to the user's supplied text after whitespace normalization, found the
heading exactly once, followed the homepage detail link successfully, and found
no runtime errors or horizontal overflow. Desktop/mobile screenshots were
visually checked. The owned fixture server and browser were cleaned up.

### 2026-11-02 — Sacrament preparation timelines

Added numbered preparation timelines for baptism of a child, First Communion,
confirmation and marriage. [The timeline summaries](../../src/content/sacrament-preparation.ts)
use the existing published guidance and reviewed corrections, including the
existing advance notice and document deadlines. They introduce no new dates or
requirements. Baptism and First Communion explicitly distinguish the child
process from the adult guidance below. Reconciliation and anointing remain
without timelines because their source describes availability or eligibility
rather than a preparation sequence.

The shared timeline appears before each page's full reading and links to the
existing detailed-guidance anchor. All source content, quotations, attributions,
documents, photographs and office contacts are preserved. Raw source records and
the independent content baseline were not modified.

The production build including TypeScript, scoped Prettier and diff checks
passed. Twelve route/viewport browser checks (six sacraments at 1440 px and
390 px) preserved all 92 reading blocks per viewport, verified one quotation band
per page and found no runtime errors or horizontal overflow. Eight WCAG A/AA
timeline scans passed; all detail links preserved the target scroll and focus.
Representative desktop/mobile screenshots were visually reviewed. The owned
fixture server and browser were cleaned up. The ordinary check still encounters
generated `.next-preview` formatting, and the unit suite retains the same three
pre-existing content-test failures (73 passed, one opt-in database skip).

### 2026-11-02 — Compact preparation timelines in the right sidebar

The user requested a quieter supporting timeline, consistent with other pages.
Moved the four preparation timelines into the existing right sidebar and replaced
the large numbered markers and repeated paragraphs with small gold dots, timing
notes and short step labels. The complete instructions remain in the main
reading column. The sidebar stacks after that reading on mobile; its detailed
conditions link still scrolls to and focuses the original content.

The production build including TypeScript, scoped formatting and diff checks
passed. Twelve browser/accessibility cases (four pages at 1440, 980 and 390 px)
confirmed right-side alignment on larger screens, mobile stacking, working
44 px detail links, a single quotation band, no overflow and no runtime errors.
Timelines measure 346 px for the four-step guides and 478 px for marriage in
these checks. Desktop/mobile screenshots were visually reviewed. The owned local
fixture server and browser were cleaned up.

### 2026-11-02 — Supporting timelines below the contact card

The user requested the compact timeline below the card. The sacrament sidebar
now keeps resource links and the existing office/contact card first, followed by
the preparation timeline. Follow-up requests removed the extra detailed-conditions
link and added one brief explanatory sentence to each step. The main reading,
quotation bands and existing contact cards remain unchanged.

The production build including TypeScript, scoped formatting and diff checks
passed. Eight desktop/mobile browser and WCAG A/AA checks verified placement
directly below the office card, one concise sentence per item, no timeline links,
no overflow and no runtime errors. Representative screenshots were visually
reviewed. The owned fixture server and browser were cleaned up.

### 2026-11-03 — Vercel prepared for the domain switch

The user authorized Vercel changes and will change nameservers in FORPSI. They
confirmed that only `farazv.sk` and `www.farazv.sk` are used (no domain email or
other subdomains), and that the Google OAuth callback
`https://farazv.sk/api/auth/callback/google` is already registered.

Created the Vercel DNS zone in `bublinecs-projects`, attached both domains to
project `farazv`, and configured `www.farazv.sk` to redirect permanently (308)
to `farazv.sk`. Vercel assigns `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
Its authoritative servers already answer for both website names. FORPSI
registration, the existing Netlify delegation, and legacy services were not
changed. Public checks found no apex MX/TXT or DS records and no DMARC record.

Production `SITE_URL` and `BETTER_AUTH_URL` changed from
`https://farazv.vercel.app` to `https://farazv.sk`; `SITE_INDEXING_ENABLED`
changed from `false` to `true`. `CONTENT_SOURCE=database` and preview settings
were preserved. Redeployed the existing successful production source
`dpl_96zAVBBjBbWnbaktxA5rLNRUVZAc` as
`dpl_DiQJCbU7scjhgin7s4ajKNG1Fzmo` (READY), without uploading local source or
modifying application/database content.

Checks through `farazv.vercel.app` passed for the homepage, database health,
1–8 November schedule, canonical `farazv.sk` URLs, public robots rules and a
177-entry sitemap using the new domain. The browser displayed 3 November with
no broken homepage images. Alternate-host admin navigation redirects to
`https://farazv.sk/admin/login`. Runtime logs included a PostgreSQL driver SSL
mode warning and one article database connection timeout; the affected article
and health endpoint subsequently returned 200 in 0.3s and 0.2s respectively.

At the preparation checkpoint, the DNS cutover was still pending. Direct custom-domain TLS could not yet be
verified; differing TLS/Host names were rejected with 421. After FORPSI delegates
to Vercel, verify both hostnames' certificates, the actual www redirect, Google
sign-in and one editorial publication. Admin navigation now uses the custom
domain, so complete that verification after the switch. Retain the old Netlify
deployment during the migration and first successful publishing cycle.

### 2026-11-03 — FORPSI nameserver change accepted; propagation underway

After the user saved the FORPSI change, WHOIS and two authoritative `.sk`
servers confirmed delegation to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
Vercel verification reported both `farazv.sk` and `www.farazv.sk` configured
correctly and verified. Requested a Vercel certificate for both names; issuance
succeeded. HTTPS checks with the real custom hostnames, valid certificate
verification and an explicit Vercel address passed for the homepage, database
health, current notices, robots, 177-entry sitemap and admin login page. The
`www` redirect returned 308 and preserved the path and query string.

At approximately 10:31 Bratislava, Quad9 already resolved the Vercel addresses;
other checked resolvers and ordinary local requests still used cached Netlify
addresses. This is a partial propagation result, not proof that every visitor
has switched. No additional FORPSI changes are needed. Complete a real Google
sign-in and editorial publication once the user's resolver reaches Vercel;
those authenticated actions were not performed by this verification.


### Repository cleanup — 3 November 2026

- Promoted the Next.js application from `remake/` to the repository root; archived
  Gatsby at `old/client/` and Strapi at `old/admin/`.
- Flattened the former admin Git repository into normal tracked source. Preserved
  its Git metadata in ignored local `.private/legacy-admin-git-backup-2026-11-03`;
  excluded its existing environment files. All 155 original admin files matched
  their pre-move hashes before staging (private files remain local only).
- Updated root CI, TypeScript exclusions, ignore rules and contributor/runbook
  paths. Preserved the old Netlify deployment by skipping automatic legacy builds.
- Renamed GitHub `bublinec/farazv-client` to `bublinec/farazv`, preserving repository
  ID 401754976, and updated the origin remote and public source link.
- Source-integrity check compared 335 moved app source/assets/tests/scripts/schema
  files: only the fixture README link changed; the later source-link update is
  intentional. Formatting, route generation, TypeScript and production build pass.
- Unit results match the pre-cleanup baseline: 73 pass, three existing static-copy
  expectation failures, one skipped. The content baseline and public copy were
  deliberately left unchanged; the combined CI check remains red on those tests.
- Public browser smoke suite on an owned compiled fixture server: 10 pass, three
  stale UI assertions fail (old liturgy label and separate magazine-list assumptions).
  The existing `/prispevky` route already redirected to `/#vyveska` before this move.
- Vercel Root Directory changed from `remake` to empty. GitHub rename retained the
  same repository ID and the branch push triggered preview deployment
  `dpl_6uLhVkTcnp5GFD4W4rTKugZthghJ` from `bublinec/farazv`.


### Local storage cleanup — 3 November 2026

- Removed legacy Gatsby dependencies (757 MB), cache (6.2 GB), generated public
  output (351 MB), both inactive Next build directories, browser test artifacts
  and obsolete tracked Playwright logs/snapshots/Yarn install state.
- Retained root application dependencies, all active and legacy sources, credentials,
  database backups, private recovery tooling and the saved admin Git history.
  Hash verification covered 772 protected files with no changes after deletion.
- Removed 100 full-page/iteration screenshots. The local original-site archive
  retains six full-page references, small index thumbnails, all 93 HTML files
  (31 source + 31 desktop + 31 mobile) and shared assets. Updated its index and
  notes; every index-local file link resolves.
- Working folder measured 9,768,400 KiB before cleanup and approximately 892 MiB
  afterward, before Git object packing; 903,940 KiB (883 MiB) after packing without
  pruning history. Added ignore coverage for Yarn install state.
- Prior root-layout production deployment `dpl_92udQ3gxmTnFQ9pCRDAnqo2SzJEn` is READY.
  Direct Vercel checks returned homepage HTTP 200, health `ok`, and WWW HTTP 308
  preserving path/query. Some recursive DNS caches still reached the former host;
  the .sk registry already delegates to the Vercel nameservers.
- This storage-only cleanup changes no application behavior. Full application
  checks were not repeated; the previously recorded test failures remain open.

### 2026-11-03 — Children's choir leadership and contacts

- Applied the owner's supplied update to `/spolocenstva/detsky-spevokol`:
  removed Zuzana Vandáková from current leadership copy and replaced Magdaléna
  Turanská's contact card with “Manželia Liečkovci” and both supplied phone
  numbers. Each number has its own telephone link. Added the supplied conductors,
  Miška Rusnáková and Mari Kunštárová, and the WhatsApp communication note.
- Preserved the existing schedule, history, photographs and raw source records.
  Deliberately reviewed the choir's public reading baseline and contact
  expectations; the original source export was not regenerated.
- `npm run check` passed before and after the change with Node 22.23.4:
  formatting, generated route types, TypeScript and 81 unit tests passed;
  one opt-in database test was skipped.
- The existing browser content check passed across all 22 static layouts,
  including both new telephone destinations, using an owned fixture server on
  port 3117 and distinct browser output. No deployment or database change was
  performed.

### Production readiness and SEO — 3 November 2026

- Added shared public metadata with canonical URLs, page-specific social previews,
  real church-photo fallback images and nonempty description fallback. Added safe
  homepage WebSite/Organization and editorial JSON-LD, excluded from private previews.
- Unified indexing guards across layout, robots and sitemap. Sitemap modification
  times now follow public snapshots; redirected entries are omitted and destinations
  deduplicated. Production public aliases redirect permanently to `SITE_URL`; preview
  navigation and existing admin-origin/API protections are preserved.
- Added root error recovery, API noindex/anti-framing headers and corrected the
  admin brand link's accessible name. Added SEO browser checks and a public
  `verify:production` command with an optional complete sitemap crawl. The new
  workflow runs after successful main-branch checks or Production deployment events.
- Reconciled stale regression expectations with previously shipped page moves,
  pagination and editor behavior (inline preview, visibility switch, published-save
  semantics, unified new-post category and current media controls). Kept private
  unpublished-content, authorization, concurrency and original-source checks.
  The previously reported magazine failures were pagination expectations (12 then
  8 results), not the `/prispevky` redirect.
- Included the owner's concurrent choir/contact changes and existing footer commit
  at their explicit request. Only the separately reviewed choir copy changes the
  editorial baseline; original raw source records remain identical.
- Final local verification: formatting, route types and TypeScript passed; unit
  suite 81 passed/one opt-in database test skipped; isolated PostgreSQL suite seven
  passed; production build passed; public/SEO/accessibility browser suite 42 passed
  with one fixture-unavailable historical-image case skipped; authenticated editor
  browser suite 17 passed. The independent forced-missing-image browser case passed.
  Test databases/processes were owned and disposable; no parish data was modified.
- Production dependency audit reported zero vulnerabilities. React changes were
  checked for server/client boundaries, safe JSON-LD, accessibility and added bundle
  weight; metadata adds no browser dependency.
- [Production readiness](../production-readiness.md) records implemented controls
  and remaining Search Console ownership, off-device scheduled backups, uptime
  alerting, real Google sign-in and media/source-freshness acceptance. Those external
  services were not activated or claimed verified by local tests.

### Final documentation and reference pass — 3 November 2026

- Reconciled contributor, architecture, route and operations documentation with
  the root application, active parish design, merged routes, magazine/gallery
  pagination, administrator/editor grants and current seven-table schema.
  Removed obsolete design-selector commands, missing browser-test references and
  links to deleted design-history directories. Local links in maintained docs resolve.
- Rewrote the Slovak editor guide around save behavior, inline preview, the
  visibility switch, Saturday 20:00 bulletin activation, Word/text import and
  actual media/settings/access controls. Published saves and settings updates are
  explicitly documented as public changes.
- Added the requested footer link to the old Gatsby site at
  https://farazv.netlify.app/ and documented its fixed deployment reference.
  Both URLs were verified with HTTP 200; current authoritative nameservers resolve
  to Vercel. Old services are historical references, not current notice sources.
- Removed the unused homepage magazine query, commented section and unused CSS.
  The rendered homepage remains unchanged apart from the requested footer link.
  Reviewed both TSX edits for server/client boundaries, parallel reads, native link
  semantics and unnecessary dependencies; no new client code or dependency was added.
- Verification: `npm run check` passed (81 unit tests, one opt-in database skip),
  the fixture production build passed, and the public/static/SEO/accessibility
  browser suite passed 42 tests with one existing media-dependent skip. The footer
  was separately inspected at 1440 and 390 pixels with the correct destination
  and no horizontal overflow. The owned test server was stopped afterward.
- The preceding production-readiness commit passed its full GitHub workflow,
  including database integration and authenticated admin tests:
  [run 41620112841](https://github.com/bublinec/farazv/actions/runs/41620112841).
  This follow-up changes no authentication or persistence code. Changes remain on
  `feat/production-readiness`; no main merge or production promotion was performed.
- Prepared a separate two-page private handover document with service ownership,
  supplied contacts and fields for registrar recovery. It is stored outside the
  repository and is intentionally excluded from this commit.


### Final release review — 3 November 2026

- The full GitHub suite passed for `b070b99`, including formatting/types/unit tests,
  the production build, public/accessibility checks, PostgreSQL integration and
  authenticated admin flows: [run 41622246099](https://github.com/bublinec/farazv/actions/runs/41622246099).
- Reviewed the complete pending merge against `origin/main`, including canonical
  redirects, sitemap filtering, safe structured data and publication boundaries.
  No additional application changes were required. Main's existing merge commit
  has the same tree as the shared branch base; no divergent implementation needs
  reconciliation. The owner explicitly requested merging this release to main.
- Confirmed Vercel project `farazv` under `bublinecs-projects`, repository-root
  Next.js build, Node 22, `npm ci` and `npm run build`.
- Removed the unused local `.next` build output and browser results after confirming
  no application server was running, reclaiming approximately 206 MiB. Dependencies,
  legacy sources, private exports, credentials and the external handover document
  were preserved. Build again before running `npm start` locally.


### Deep codebase review — 3 November 2026

- Started from the deployed `a691942` release on `review/codebase-hardening`.
  [The review](../codebase-review-2026-11-03.md) records inspected boundaries,
  reproduced defects, prioritized larger work and acceptance criteria.
- Fixed media pagination using edited/failed-search input with a previous cursor;
  exact JSON media-type validation, stream cleanup and oversized-body cancellation;
  and article covers collapsing to zero height until image delivery. Regression
  tests failed before each corresponding fix and passed afterward.
- Corrected the authentication runbook from eight hours to the implemented fixed
  180-day session lifetime, clarified historical migration status and corrected
  the admin test-runner guidance about another developer's server.
- Verification: formatting/types and 83 unit passes (one opt-in DB skip), fixture
  production builds, seven local PostgreSQL integration passes, 18 authenticated
  admin browser passes and 44 final public/SEO/accessibility passes (one opt-in
  historical-image skip). Three affected admin preview/gallery checks passed again
  after the cover fix. No production provider credentials were used by these tests.
- Six compiled-fixture performance samples had no page errors, horizontal overflow
  or detected editor runtime. Contact loaded about 1.59 MB decoded JavaScript with
  its map; defer map loading as a separate measured UX change. The article sample's
  layout-shift value fell from 0.1659 to 0.0369 after reserving cover dimensions.
  These are unthrottled local samples, not field Core Web Vitals.
- The owner chose to skip the external dependency advisory audit. No current
  vulnerability result is claimed. Scheduled backups, Search Console, live Google
  acceptance and platform release gates still need external verification.
- Focused changes stay on the review branch. No main merge, production deployment,
  schema migration, live content change or provider-setting mutation is part of
  this review. Disposable database runners cleaned up their own resources.


### Contact spacing and authorized release — 3 November 2026

- The owner requested merging the codebase review to main and tightening the
  contact page's phone, email and IBAN spacing before release.
- Contact labels and values now remain beside each other on mobile, with 4 px
  between rows. The narrow label column retains the small label typography;
  phone/email links retain a minimum 44 px height. Contact facts are unchanged.
- Inspected the contact block at 320, 390, 768 and 1440 px: no horizontal overflow,
  the email remains one line even at 320 px, and the existing contact accessibility
  check passed. This is a CSS-only follow-up; no new dependency or data migration.
- Verified Vercel project `farazv`, team `bublinecs-projects`, root directory `.`,
  production branch `main`, Node 22 and the existing `npm ci` / `npm run build`
  configuration. The connected MCP returned a project-not-found error; the
  authenticated CLI confirmed the correct project successfully.
- Release sequence: final branch CI, merge to main, Git-triggered production build,
  then read-only production smoke verification. This supersedes the review's earlier
  preparation-only scope; it does not authorize the larger roadmap items.

- The first final-branch CI run (`41652209329`) passed types/unit/build but failed
  the public failed-request pagination check. A controlled delayed-JavaScript test
  reproduced an enabled pagination button before client handlers were ready.
  Added a mount-readiness guard and regression; normal pagination, delayed startup
  and failure/retry pass locally. Full CI is required again before merge; the
  failing assertion was retained and no retry/sleep workaround was added.


### Bulletin readability — 4 November 2026

- Preserved the desktop schedule-left / notices-right composition and parish
  photography, serif type and warm colors. Mobile uses a compact 190 px hero,
  visible collapsed-day Mass times, a date range and 44 px jump links to today
  and the notices. Narrow schedule columns adapt through a container query.
- The owner clarified that Mass designation (označenie) is optional. This bulletin
  view renders only a supplied nonblank `label`, with no location or church-name
  fallback and no empty designation row. Other schedule views and saved data are
  unchanged. The explicitly synthetic demo includes occasional designations.
- Increased notice prose to 17.1 px, reduced mobile insets and kept the support
  card below notices through 800 px. Scoped list styles to outer notice rows,
  preserved nested rich-text lists and gave support links 44 px targets. Editorial
  announcement text and live records were not rewritten.
- Verified 320, 390, 551, 768, 801, 1024 and 1440 px layouts without horizontal
  overflow; both jump links fit one row at 320 px. A 200% text-size check found
  no overflow in the bulletin content. Existing interaction coverage now checks
  visible mobile times, optional designations, absence of location/fallback
  names, jump-link focus and Sunday–Sunday expansion behavior.
- Verification: formatter/types and 83 unit passes (one opt-in database skip),
  isolated fixture production build, and 25 public/accessibility browser passes
  (one opt-in historical-image skip) using the suite's fixed 31 October date.
  The initial baseline formatter failure in the existing footer was corrected
  with formatting only. React boundaries, state updates, keys and keyboard
  behavior were reviewed; no dependencies, schema or provider settings changed.
- Changes are local implementation work; no commit, push or deployment was
  performed. The owned preview used port 3114 and `.next-preview`; existing
  development servers were preserved.


### Compact liturgy-first headers — 4 November 2026

- The owner refined the earlier bulletin design: full liturgy names and ranks
  must remain visible; weekday labels can be abbreviated; Mass times can live
  inside expanded entries. This supersedes the earlier collapsed-time summary.
- Replaced the separate full weekday heading with a short date-column label and
  an accessible full weekday. The complete supplied liturgy becomes the main
  header text, with its full rank or observance below. No liturgy text is parsed,
  shortened, hidden or moved into details; missing-title and unpublished-schedule
  context still use the calendar weekday and existing status messages.
- Removed the header time column and separators. Expanded Mass rows retain all
  times, duplicate simultaneous entries, intentions, celebrants and optional
  designations. Today remains expanded initially; no-Mass status stays visible.
- Verified the fixture production build, 83 unit passes (one opt-in database
  skip), six focused browser/accessibility passes, and visual layouts at 320,
  390, 768, 801 and 1440 px without horizontal overflow or browser errors.
  A 200% text-size check also fits. The browser regression checks accessible
  weekday names, full long liturgy text and times appearing after expansion.
- Changes are local and uncommitted. The owned compiled preview used port 3114
  and `.next-preview`; no live content, provider settings or other developer
  processes were changed.

- Follow-up at the owner's request: removed the “Dnešné omše” / “Oznamy”
  shortcut navigation and its unused styles, and removed obsolete shortcut-link
  assertions from the existing bulletin test. Section anchor IDs remain valid.


### Full weekday headings and quiet time previews — 4 November 2026

- The owner preferred restoring full weekday headings and a smaller time preview
  near the arrow. Full weekday headings are now 20.7 px, with complete liturgy
  text at 16.2 px and existing rank/observance text retained. Date abbreviations
  no longer repeat the weekday.
- A muted 13.5 px preview sits above the desktop chevron in aligned columns,
  without separator dots or deduplication. Narrow schedule columns place the
  preview beneath the liturgy, preserving text width; larger text can reflow to
  fewer columns. Expanded intentions/designations use 17.1 px, times 18.9 px and
  celebrants 15.3 px, so the main day heading has a clearer hierarchy.
- Optional designations still have no location fallback. Full liturgy details,
  no-Mass/unpublished status, today's initial expansion and the existing page
  columns are preserved. The removed shortcut links remain absent.
- Verification: fixture production build, formatter/types and 83 unit passes
  (one opt-in database skip), plus six focused browser/accessibility passes.
  Visual checks at 320, 390, 768, 801 and 1440 px and 200% text sizing found no
  schedule overflow or browser errors. The owned preview used port 3114 and
  `.next-preview`; no deployment or live content change was performed.

- Follow-up: increased the header time preview from 13.5 px to 15.3 px at the
  owner's request; its aligned grid and muted color are retained.


### Mobile bulletin entry and support text — 4 November 2026

- The owner's latest instruction removes Mass-time previews from collapsed days,
  superseding the earlier preview adjustments. Full weekday headings, complete
  liturgy titles/ranks, optional designations and expanded Mass details remain.
- Public mobile entry aligns today's card 24 px below the viewport top after
  page/font layout and browser restoration settle. This also covers opening and
  reloading saved current-day links. Other explicit anchors and desktop opening
  retain their behavior; visitor interaction cancels pending automatic scrolling.
  The shared admin preview does not enable this public-entry behavior.
- Increased the support-card heading from 19.3 to 21.6 px and supporting text from
  14.4 to 17.1 px. Visual checks at 320, 390, 801 and 1440 px found no horizontal
  overflow. Contact facts and the desktop left/right layout are unchanged.
- Verification: isolated fixture production build, formatter/types, 83 unit passes
  (one opt-in database skip), and nine focused browser/accessibility passes.
  Browser coverage includes opening/reload, saved day links, notice anchors,
  desktop entry, interaction during delayed font loading, collapsed-day behavior
  and four responsive widths. The interaction test keeps a stable day locator
  after expansion; saved-link entry navigates from another page before checking
  the initial alignment. No assertions were relaxed or retries added.
- Reviewed React effect cleanup, refs, server/client props and keyboard behavior.
  The owned compiled preview used port 3114 and `.next-preview`; other development
  servers, live parish content and provider settings were preserved.

- Typography follow-up: reduced wrapped liturgy-title line height from 1.45 to
  1.3 and Mass-intention line height from 1.6 to 1.4, keeping existing font sizes
  and row padding. Checked multi-line liturgy and a temporary long intention in
  the local browser at 320, 390 and 1440 px without overflow. The fixture build,
  formatter/types, 83 unit tests (one opt-in skip) and nine focused browser checks
  passed. No source text, data or application behavior changed.


### Search metadata and archive indexing — 4 November 2026

- The owner requested implementing metadata improvements and noindex protection
  for the preserved Netlify site. Added reviewed search/share copy for 32 public
  routes in `src/content/search-metadata.ts`, separate from visible headings and
  source reading copy. Contact now uses “Kontakt a úradné hodiny”; recurring
  magazine titles include a topic or publication period. Other long excerpts
  become whitespace-normalized, word-boundary summaries up to 160 characters.
  This editorial length convention is not a Google indexing requirement.
- Applying the new helper to all 177 currently public sitemap pages produced no
  duplicate titles or descriptions. The existing source “Kántrové dni” article
  repeats the Zolná report's body; its distinct description identifies the
  publication without inventing another event. The duplicated body remains a
  content-review item; no stored/public article text or unpublished record changed.
- Prepared archive-only `X-Robots-Tag: noindex, follow`, shared Helmet metadata
  and a crawlable static robots file. Removed the old robots generator's
  google.com placeholder output and corrected its site URL. Automatic legacy
  builds remain disabled. The owner confirmed Netlify access is unavailable;
  **the live archive remains unprotected until its account owner publishes the
  prepared headers**. `old/README.md` explains how to overlay the two files onto
  the complete saved output without rebuilding Gatsby or contacting Railway.
- Verification: formatter/types, 86 unit passes (one opt-in database skip), fixture
  production build, eight SEO browser passes, and the all-177-page metadata
  projection described above. Legacy config loads, the shared SEO component
  transpiles and archive headers/robots were checked. No legacy dependency
  installation or full Gatsby build was needed. The owned preview used port 3114
  and `.next-preview`; existing development processes and provider settings were
  preserved. Search Console setup and unfinished-page indexing were outside this
  requested follow-up.

### Private lector schedules — 5 November 2026

- Added a restricted lector CMS role and private monthly PDF module on the owner's
  explicitly requested `filip/upravy` branch. Administrator emails remain solely
  in `ADMIN_EMAIL_ALLOWLIST`; CMS-created accounts can be editor or lector only.
  Google login, existing publication rules and public source copy remain unchanged.
- The [lector changelog](../lector-schedules-changelog-2026-11-05.md) owns the
  implementation map, privacy model, local migration/review steps and rollback caveat.
  The [editor guide](../editor-guide.md#rozpisy-lektorov) owns user instructions.
  Passwords are entered once, minimum eight characters, and stored privately as
  salted hashes; they never become part of public settings snapshots.
- Verification used Node 22.23.4/npm 10.9.9, public fixtures, an owned compiled
  `.next-preview` server on port 3197 and disposable loopback PostgreSQL 18.6
  databases. `npm run check`: 92 passes, two opt-in database skips. Fixture
  production build passed. Existing content-store integration: seven passes;
  new lector integration: eleven passes including coordinated password and file races.
- Public browser/SEO/static-content/accessibility verification: 50 passes and the
  opt-in unavailable historical-image case skipped because no migrated-image path
  was supplied. All 22 static layouts retained their approved reading and links.
  Full authenticated CMS browser suite: 19 passes, covering the 18 existing cases
  and the new real PDF/role workflow. Auth uses local test-only Better Auth cookies;
  this does not establish live Google-provider acceptance.
- A fresh static review checked authorization, secret separation, token revision
  locks, version tombstones and month rules. The identified focus issue was
  reproduced and fixed with a browser regression. Desktop/mobile visual inspection
  also identified a header overlap confined to the new lector role; its targeted
  wrap adjustment and confirming check are recorded in the implementation ledger.
- No production migration, deploy, external account edit or main merge was performed.
  Manual review with Juraj is the next acceptance step. The private PDFs and grant
  rows used for testing contain only synthetic local data, not parish contacts.
- Final lector-only header confirmation passed at 390 and 320 px, including
  the entire PDF/role workflow again on the final compiled build. The previous
  18 existing admin cases are unaffected by this role-scoped layout rule.

### Lector footer entry — 5 November 2026

- Added the explicitly requested footer entry below Podnety a nápady. It opens
  the existing password dialog directly from every public page. The lector-page
  and footer entry share only in-memory tab authorization; reload/new-tab denial
  and all server checks remain intact. The modal uses a body portal to avoid
  footer colors affecting readable content. No noticeboard or CMS behavior changed.
- Verification: npm check (92 passes, two opt-in skips), isolated fixture build,
  14 browser/accessibility passes and one optional historical-image skip. The
  new footer test was observed failing before implementation. Shared unlocking,
  keyboard focus, Escape, a new tab and refresh are covered by the browser flow.
- An owned compiled server used port 3217; the user's existing development server
  was preserved. Scope and user instructions are recorded in the lector changelog.
### Lector archive and footer refinement — 5 November 2026

- Made the existing private monthly archive discoverable even when empty and
  explained retention until manual PDF removal. No automatic destructive cleanup
  was introduced. Added the requested missing-password suggestions link and
  aligned the footer entry with its sibling links, including a right arrow.
- Scope and fresh check/build/integration/browser evidence are recorded in the
  [lector changelog](../lector-schedules-changelog-2026-11-05.md#update-lektorov-v2--nahrávanie-súborov).
  The owner authorized publishing to filip/upravy first and then main.