# Implementation plan and progress

[Overview](README.md) · [Architecture](architecture.md) · [Decision log](decisions.md)

The user authorized completing all remaining work in one run. The four stages
remain the implementation/review structure; earlier instructions to pause after
each checkpoint are superseded. Review records and honest verification still
matter. A protected hosted preview and Neon import are now available; live Google
OAuth, source freshness, ongoing backup operations and production cutover remain separate.

## Four stages

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
  true 404 behavior have implementation/browser coverage. See [route details](../../remake/docs/routes.md).
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
| Local performance           | Six unthrottled production samples: LCP 84–136 ms, CLS 0–0.0002; eight JavaScript files/468–474 KiB decoded, no requested editor runtime, runtime errors, overflow or raw broken images. Local only; [methods/limits](../../remake/docs/quality-audit.md)               |

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
verification table and [route record](../../remake/docs/routes.md#local-verification-record).
At that point Google credentials remained absent and the hosted restore drill
was outstanding; the successful subsequent drill is recorded below. Local lab performance evidence
belongs in the [quality audit](../../remake/docs/quality-audit.md).

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
methods and limits are in the [quality audit](../../remake/docs/quality-audit.md).

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
in the remake. See the [review record](../../remake/docs/static-content-review.md);
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
