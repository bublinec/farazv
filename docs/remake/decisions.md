# Decision log

[Overview](README.md) · [Architecture](architecture.md) · [Plan and evidence](plan.md)

Recorded/reconciled on **31 October 2026**. **User choice** records an explicit
request or accepted plan; **selected default** records delegated implementation
judgment; **deferred** is outside v1. Implementation and external-service status
are stated separately. Later entries supersede earlier sequencing assumptions.

## D01 — Replace Gatsby and Strapi

**User choice; implemented with hosted preview.** Use one Next.js public website and custom
admin on the owner's Vercel account. Keep the app in `remake/` alongside Gatsby.
This supersedes the early audit's tentative recommendation to retain Strapi.
The earlier possible move to repository root is not a release prerequisite:
Vercel now targets `remake/` directly, preserving legacy source through cutover.

## D02 — SQL content, presentation references and source freshness

**User choice; implemented.** The private SQL snapshot supplies content, statuses,
relationships and metadata; existing pages/screenshots guide presentation.
Parse an explicit content-table projection rather than restoring old auth/config.
Public API comparisons cannot prove unpublished content freshness. Final cutover
still needs an authorized current private export/reconciliation and editing
freeze. Keep raw source and recovery evidence private.

## D03 — Publish all 146 imported magazine articles

**User choice; implemented.** Publish all 146, including 114 unpublished in the
source. This is a one-time migration exception, superseding the earlier plan to
keep those 114 private; it does not publish future drafts or other content kinds.
Retain source status/timestamps separately. Display publication date when present,
otherwise original creation date interpreted in Bratislava.

## D04 — Incremental loading means ten summaries, then six

**User choice; implemented.** All imported articles are available together.
Incremental loading applies to the listing, not publication batches: fetch ten
summaries initially, six per click, stable date/ID ordering and lazy images.
Do not ship all article bodies to paginate them in the browser.

## D05 — Other statuses and private history stay distinct

**User choice; implemented.** Keep 86 unpublished news posts private, along with
unpublished notices/events/bulletins. Preserve bulletin history in admin without
a public archive of intentions/donations. **Selected default:** nine anomalous or
duplicate source bulletins are read-only and ineligible; 153 valid weeks remain
editable. An old-week edit never makes it current.

## D06 — Informational pages use purpose-designed React layouts

**User choice; implemented.** Use ordinary TSX layouts/typed definitions, with
server-only full reading copy from 29 published source pages. Rich text belongs
inside reading areas; the old page builder is not recreated. Shared volatile
facts come from settings. Unpublished static copy stays private. Dated passages retain their original
wording and visibility; automatic archive labels/advice are not added.

## D07 — Familiar identity and clearer visitor hierarchy

**User choice; implemented.** Retain Ubuntu, blue/gold tokens and parish photos.
Keep the Mass hero, uncropped poster wall, news, highlights, gallery, magazine,
community links and donations. Preserve URLs while putting Birmovanci under
Sviatosti. Use bounded day/swipe/today controls, keyboard menus/viewers and compact
mobile layouts. Avoid repeating the same homepage poster destination as news.

## D08 — Small visual admin and essential settings

**User choice; implemented.** Editors manage bulletins, editorial records,
posters, contacts, priests, hours, Náuky, donation details and recurring times.
Names/authors/celebrants/categories remain text, not new business entities.
**Selected defaults:** Tiptap JSON, separate draft/public snapshots, atomic edit
versions, private preview, dirty-navigation warnings and retained values after
failures/conflicts. Settings cannot be unpublished. Autosave and approvals remain
outside v1.

## D09 — Equal-access Google allowlist authentication

**User constraint; selected default; implemented, live OAuth pending.** A few
editors share full access. Better Auth Google-only stateless encrypted/signed
sessions avoid passwords, auth tables and account/role administration. Every
protected operation checks verified email and the current exact private
allowlist, with same-origin mutation checks. Missing configuration denies access.
Real-cookie tests pass; Google client credentials/callback verification remain
outstanding and are not replaced by those tests.

## D10 — Sunday–Sunday viewing with one owner for each date

**User choice; implemented.** Keep Sunday–Sunday public display and editor-entered
liturgy. **Selected default:** edit Monday–Sunday; resolve the preceding Sunday
from its actual owner; choose the later valid week during overlaps. Use
Europe/Bratislava calendar dates and DST-aware midnight refresh. Copy only regular
times/locations/labels into new weeks. Never recycle intentions, celebrants,
liturgy or donations. The source confirms no recurring template, so imported
regular times stay empty until parish confirmation. Fallback shows only available
published times and is explicitly labeled.

## D11 — Reuse Cloudinary and support signed image uploads

**User choice; implemented and provider smoke-tested.** Keep existing IDs/URLs,
responsive delivery, previews and alternative text. Server-selected upload fields,
new-ID namespace and overwrite protection preserve old originals. Completion
verifies a signature and independent provider metadata. **Selected limits:**
JPG/PNG/WebP/AVIF/GIF up to 10 MB; one-hour provider signature and five-minute
application completion ticket. Detaching content never deletes a shared original.
The real temporary upload/check/cleanup passed; original-media recovery is still
incomplete (D20).

## D12 — One application and free-first services

**User constraint; selected defaults; implemented stack.** Next.js App Router,
TypeScript, CSS Modules, Drizzle/PostgreSQL, Better Auth and Tiptap keep the project
small. Exact dependencies and Node/npm are pinned under `remake/`. The free Neon
resource `farazv` is provisioned in Frankfurt with PostgreSQL 18.6; hosted import
counts match the local database. Record actual service limits/eligibility and backup
responsibilities before production; a free tier is not an operational guarantee.

## D13 — Defer PDF workflows and unrelated systems

**Deferred by user.** No new PDF uploads or PDF-to-form parsing in v1. Existing
public attachment links remain. No new contact-form backend, search service,
calendar backend, public bulletin archive, role hierarchy or approval workflow.
Dormant legacy models alone do not create new feature requirements.

## D14 — Retain four review records and durable Markdown

**Original user choice; sequencing superseded by D17.** Record public design,
admin/publishing, migration and release evidence in four stages. Keep architecture,
plan, decisions and progress readable by people and AI. Earlier pauses after each
review no longer block the user's authorized implementation run. Automated checks
do not imply parish/design acceptance or completed production cutover.

## D15 — Source-backed review corrections

**Selected defaults; implemented.** Scope URL uniqueness to actual route families,
keep paths reserved after unpublication, preserve incomplete private drafts,
reconcile alternate bodies, and separate status from poster/news placement.
Keep shared settings consistent; distinguish an outage from an empty/no-Mass
schedule; retain failed form values; separate cache-refresh retry from publishing.
These corrections add no new CMS or permission system.

## D16 — Public fixtures remain an explicit design mode

**Historical authorization; implemented.** Stage 1 used 20 already-public article
examples, shortened text and synthetic rolling bulletins without private source
content. That preview remains available through explicit nonproduction
`CONTENT_SOURCE=fixtures`. The integrated real application now reads published
PostgreSQL snapshots; fixtures are never an automatic database-error fallback.
The original stage-1-only scope/pause is superseded by D17.

## D17 — Implement all remaining work without inter-stage pauses

**Latest user authorization.** “Implement the rest… everything in the next run”
authorizes the remaining implementation, integration and verification together.
Continue useful work through all stages and preserve evidence instead of stopping
for the earlier review gates. External prerequisites still require their actual
credentials, service state and applicable authorization; do not claim deployment,
freshness or recovery merely because their code is ready.

## D18 — Keep the app in `remake/` and preserve legacy source

**Selected implementation default; hosted preview deployed.** The owner's
new Vercel project `farazv` uses `rootDirectory=remake` and Node 22 on the personal
team. This supports deployment without moving/deleting Gatsby or unrelated files.
A protected Preview-environment deployment is running with the hosted database;
live `farazv.sk`, the legacy stack and DNS are unchanged. The first manual Vercel
deployment defaulted to the new project's Production environment before its
database variables were configured; both stable aliases now target the explicit
Preview deployment. That historical Vercel label does not indicate live cutover.
Repository cleanup can be reviewed separately;
retain old service/data/media through a successful real weekly publishing cycle.

## D19 — Record the current authorization and hosting state accurately

**User updates and verified outcomes.** Neon terms were accepted and provisioning
completed; the hosted import contains the verified 414 content, 1,081 media and
30 static provenance records. The user explicitly approved the read-only legacy
freshness check after its earlier automatic approval denial, superseding that
blocked authorization state. The check timed out without results or changes;
snapshot freshness remains unconfirmed. A fresh private export/reconciliation
and editing freeze remain release prerequisites. Google OAuth credentials remain
absent; the intended preview callback is recorded in the operations runbook.

## D20 — Preserve missing-media evidence without inventing replacements

**Verified limitation; selected recovery approach.** Audit found 76 original URLs
returning 404 and five unreferenced PDFs returning 401. No matching active/deleted
account backup or local recovery copy was found. Preserve private references and
the unsent support CSV, keep a public missing-image state, and recover/resolve
limitations with the owner. Do not bypass PDF restrictions, substitute unrelated
photos or declare recovery complete. Current Cloudinary upload access does not
restore deleted originals.

## D21 — Donation categories and unnamed amounts retain their meaning

**Source-backed implementation clarification.** Preserve source child category,
Slovak label and ordering; omit only empty structural parent containers. A real
amount can have a blank donor label; do not invent a donor or amount. Category is
optional plain text (up to 150 characters). New publication rejects a row only
when both donor/description and amount are blank; draft rows may remain incomplete.

## D22 — Separate automated checks from live acceptance and cutover

**Selected default; implemented.** CI uses fixtures/synthetic records, isolated
local PostgreSQL databases and real Better Auth cookie verification with test-only
provider fields. It receives no production secrets and does not deploy. A real
Cloudinary smoke separately exercised signed upload/completion/cleanup. Backup
and guarded separate-target restore were rehearsed locally on PostgreSQL 14
and against hosted PostgreSQL 18.6 using compatible private client tools. The
hosted drill matched five tables/1,530 rows and schema/index/sequence hashes,
verified guards and left the source unchanged. A scheduled off-device backup
policy still needs activation. Keep Google login,
missing-media recovery, final source synchronization and domain cutover explicit
until verified in the real environments.

## D23 — Use one fixed origin for admin entry on hosted aliases

**Source-backed integration correction; implemented.** Better Auth and mutation
guards trust one configured origin. Opening admin on another preview alias must
therefore move page navigation to the fixed HTTPS `BETTER_AUTH_URL` before login.
A Vercel-only GET/HEAD proxy covers every `/admin` page and preserves path/query;
the configured origin alone determines its destination. Canonical visits and
ordinary local development continue normally. API mutations are not redirected,
and no alternate trusted origin, public login or authentication bypass is added.
The deployed behavior passed 19 read-only HTTP assertions and a mobile login-page
check; real Google sign-in remains unverified without its credentials.

## D24 — Keep imported excerpts separate from complete article bodies

**Source-backed integration correction; implemented.** A legacy lead could
contain Markdown or a complete article. Imported summaries therefore use plain
text, whitespace normalization and a bounded source/fallback excerpt instead of
copying the full lead. The corrected projection updated 179 records locally and
on Neon, left 235 unchanged and reported no conflicts. All 146 magazine excerpts
are 25–300 characters; canonical article bodies are unchanged. This corrects the
projection without discarding source provenance or replacing complete content.

## D25 — Refresh the public data cache after direct imports

**Verified operational requirement.** Editor publication invalidates the cache;
the separate importer cannot call Next's request-context invalidation APIs.
Purge the selected project's data cache or request authenticated admin revalidation
after an import. A deployment alone retained old summaries in the hosted check.
After explicit purge, all 146 hosted summaries were unique, at most 300 characters
and free of private fields across 24 requests. The operations runbook records the
command; deployment protection remains enabled.

## D26 — Preserve static-page content; change presentation gently

**Latest explicit user instruction; implemented and audited.** Keep substantive
static content as on the old pages, especially sacramental instructions and
history. Layouts may change; titles and introductory descriptions may be gently
rephrased. Do not rewrite requirements, times, quotations or historical details.
This supersedes the earlier baptism-time substitution, automatic archive labels
and invented placeholder-community explanations. Keep legacy SEO/editor notes
out of reading copy. The [review](../static-content-review.md)
records all 24 route checks and corrections; canonical reading text stays intact.

## D27 — Refactor around explicit behavior owners (31 October 2026)

**User choice; implemented locally.** Preserve content and behavior while making
routine changes easy to locate. Keep ordinary React/TypeScript, focused state
hooks, family validation and query/command boundaries; add no generic repository,
form engine, global state or schema dependency. Pin formatting and share the
local/CI fast check. Keep semantic whitespace between logical phases.

**Selected defaults:** importer writes use atomic observed-version comparisons;
new settings have blank facts; persisted record kinds correlate with documents.
Real photos are independent of synthetic demos. Static regeneration requires an
explicit private input and cannot update the separately approved baseline.
Existing distinct draft/publication limits remain tested policy, not accidental
relaxations. No schema/data migration or hosted deployment is needed for this
refactor. See [implementation and verification](refactor-plan.md).

## D28 — Preserve parish character and compare a warmer design (31 October 2026)

**User choice; local study implemented.** The design should feel familiar to the
parish and celebrate its own church. Restore genuine small photographic accents
and a more personal rhythm while keeping navigation and reading clear. Preserve
v1 source/screenshots before making v2. This supersedes treating the all-Ubuntu,
quiet card/rule presentation as the only visual direction in D07; it does not yet
replace the default or approve a hosted redesign.

**Selected experiment:** Source Serif public headings/reading paired with Ubuntu
for practical UI, warmer ivory/blue/gold, original tower illustration and real
pew/vault/window/book details. V2 is selected only in local/nonproduction public
views; both designs share content, routes and behavior. The full analysis,
comparison and owners are in [the design record](design-direction.md).

## D29 — Refresh expired guidance and improve reading tasks (31 October 2026)

**User choice; implemented locally.** A further detail pass may remove/update
expired meetings, courses and deadlines. This supersedes D26's strict preservation
for explicitly reviewed operational items; history, teaching and credits remain.
No new parish dates are guessed. Preserve the raw import and keep public
corrections explicit, guarded and recorded. The four edited pages and one expired
form are listed in [the content refresh](content-refresh-2026-10-31.md).

**Selected refinements:** notices before the welcome section, homepage shortcuts,
clear today/selected status, larger mobile targets, practical sacrament links and
long-page topic navigation. The warm church identity remains; v1 is still the
default presentation, with both variants sharing the refreshed reading copy.

## D30 — Keep v2 with the original homepage hero (31 October 2026)

**User choice; implemented locally.** V2 is accepted overall with the homepage
hero from v1. Restore its full-width church photograph, dark overlay, centered
schedule/cards and Ubuntu title. Keep the current semantic date/today markers,
Sunday–Sunday ordering and minimum 44 px controls, including four days per row on
small screens. One shared hero avoids maintaining separate schedule presentations.

This supersedes the split-photo/cream hero experiment in D28. V2's warmer
masthead, serif reading, church accents and later detail refinements remain.
The original v1, v2 and refined-v2 source/capture records stay immutable. The
selection cookie, nonproduction-only selectors and production default are
unchanged; promoting the chosen composition is still an explicit release step.
See [the current design direction](design-direction.md).

## D31 — Restore page photographs and sacrament bands (31 October 2026)

**User choice; implemented locally, verification pending.** Preserve the original
page-specific photographs of church details rather than repeating one small
decorative window across headers. V2 reuses the exported covers where appropriate;
five stock/illustration covers use genuine church-gallery details. The news list
and curated discovery page also receive real church photographs. These are
presentation choices: all 29 raw source records, 24 layouts and 224 approved
current reading blocks remain unchanged.

Restore the original homepage six-sacrament section: the existing precomposed
`window.png` background, dark overlay, centered descriptions and gold links, with
the original public summaries and destinations verbatim. Restore full-width
light-blue catechism bands below the six sacrament heroes, with their complete
existing quotations and attributions exactly once. Preserve source reading order
and destination anchors. The window asset has no recorded photographer; do not
assign the separate gallery's credit to it.

This refines D28's photographic accents without changing D30: the homepage hero
remains the shared v1 composition. V1 and its saved records remain preserved;
selectors, production default, content publication and hosting are unchanged.
See [the design direction](design-direction.md) for component owners and scope.

## D32 — Sacrament and service pages are editable in the CMS (9 November 2026)

**User choice; implemented on `filip/upravy`, not released.** The owner asked
to edit the six sacrament pages and the "Služby vo farnosti" pages (photos,
text, quotation, aside, facts, links, preparation steps) without code changes,
to add content blocks and to add new service or sacrament pages. This narrows
D06 and D26 for these eleven routes: their source-controlled version remains the
public fallback and the reviewed baseline, and nothing changes publicly until an
editor publishes a page.

- A `page` record kind stores the whole page. "Začať upravovať" copies the
  current code version (updates and presentation rules applied, closed questions
  kept closed) into a private draft; tests prove the copy is complete.
- A published page replaces its code version; turning publication off returns
  the code version. New pages are added under `/sviatosti/*` or
  `/spolocenstva/*`, cannot take an existing route and appear at the end of
  their menu group and homepage cards only when published. Existing card and
  menu texts are unchanged.
- Every write of a page is kept in `content_revisions` with author and time.
  Restoring a version saves it; like any save, a published page shows it at once.
- Layout rules tied to routes stay in code: the office aside from settings,
  baptism/marriage Náuky, the hospital section, the lector schedule button, the
  six-sacrament band and the reviewed photograph crop.
- Without a database (fixtures, outage) the code version is shown.

## D33 — One-letter words stay with the next word in the hero (9 November 2026)

**User choice (dean's request); implemented on `filip/upravy`.** Slovak
one-letter words (v, k, s, z, a, o, u, i) must not end a line. The homepage hero
title, liturgical type, gospel verse and notice join them to the next word with
a non-breaking space (`src/lib/typography.ts`).
