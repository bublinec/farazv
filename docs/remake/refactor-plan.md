# Implementation review and refactor record

[Overview](README.md) · [Architecture](architecture.md) · [Implementation history](plan.md) · [Content preservation](../../remake/docs/static-content-review.md)

Reviewed and implemented **31 October 2026** after the user requested the
refactor. **Status: implemented locally; integrated verification passed.**
No hosted import, provider mutation, provisioning or deployment is part of this
refactor. The findings below record the pre-refactor implementation; the current
owners and verification are listed in the completion record.

The existing Next.js/PostgreSQL/CSS Modules structure is suitable for this site.
Keep it. The useful work is removing competing sources of truth, giving stateful
operations clear owners, and making existing rules easy to find. Some large files
contain legitimate content or forms; line count alone is not a reason to split them.

## Original findings, in priority order

### R1 — Import updates can overwrite a concurrent editor save

**P1, correctness.** [migration/apply-import.ts](../../remake/scripts/migration/apply-import.ts),
lines 31–101, reads existing versions, checks conflicts in memory, then updates
by ID alone. Its advisory lock serializes importers; editor saves do not take
that lock. If an editor commits after the import's read, an import of changed
source can replace the newer draft/published snapshot. This finding comes from
static inspection; the review did not execute a race against any database.

Use an atomic `UPDATE ... WHERE id = observed_id AND version = observed_version
RETURNING id`. Report a conflict if nothing was updated. Increment counters only
after successful writes, and continue importing unrelated records as the current
contract permits. Handle a concurrent same-ID insert without replacing it.
Keep the transaction, importer lock, stable slugs and existing conflict policy.

The [integration test](../../remake/tests/content-store.integration.test.ts),
lines 364–375, checks an edit completed **before** import begins. Add a deterministic
race test using coordinated transactions, without timing sleeps. Verify the
editor's draft, published snapshot, version and provenance survive.

### R2 — Real settings creation depends on demo settings

**P2, boundary and default behavior.**
[content-store.ts](../../remake/src/server/content-store.ts), lines 23 and 174,
initializes a new real settings record using fixture contacts, hours and payment
details. This concerns initialization of an empty database; existing imported
settings are not implicated.

Create an intentionally incomplete settings draft, with blank required values
and empty arrays, and require completion before publication. Keep this small
behavior correction separate from mechanical extraction. Move permanent public
photographs/assets out of `fixtures.ts`; retain demo records/schedules behind
the explicit fixture adapter. Do not alter current parish facts or database rows.

### R3 — Static pages retain a second, unused version of their body copy

**P2, content fidelity and navigation.**
[information.ts](../../remake/src/content/information.ts), lines 53–700, mixes
layout metadata and abridged fallback prose. **23 of 24** page definitions use
published source, so their `sections` prose is unreachable through
[ReadingCopy](../../remake/src/components/information/InformationPage.tsx).
Only `objav-krista` currently uses the curated fallback.

Remove only proven-unused body sections. Keep rendered titles, gentle intros,
facts, timelines, links and credits. Represent source-backed pages and the one
curated fallback explicitly; a missing expected source must fail a check instead
of silently choosing different prose.

First make the approved **24 routes / 230 reading blocks** check portable.
[information.test.ts](../../remake/tests/information.test.ts) currently protects
structure, gallery counts, safety and excluded SEO fields; the complete rendered
comparison is only in a private audit artifact. Add a reviewed public-content
baseline for text/order, citations, credits, captions, asset references and link
destinations. Keep the private dump out of tests/CI. The generator must not
silently regenerate the approval baseline together with its output.

The 8,760-line [information-content.ts](../../remake/src/content/information-content.ts)
is generated data. Preserve all **29 exported records**, including records not
directly represented by the 24 static layouts. Do not manually reorganize its prose.

### R4 — Record types allow mismatched kinds and documents

**P2, type clarity.** [documents.ts](../../remake/src/content/documents.ts),
line 71, gives `kind` and `draft/published` independent unions. Components and
storage consequently repeat assertions such as `as BulletinDocument` after
checking `kind`.

Use a small kind-to-document map and a discriminated record union. Keep the
existing envelope's `kind`; add no duplicate discriminator or database migration.
Narrow forms/previews with an exhaustive switch and contain database/HTTP
conversion at explicit boundaries. Keep historical quarantined data readable;
do not run it through strict new-publication rules during deserialization.

### R5 — Draft parsing and publication validation repeat structural rules

**P2, policy drift.** [validation.ts](../../remake/src/server/validation.ts),
line 410, normalizes a draft, then repeats many shape checks while publishing.
For example, address allows 1,000 characters in draft parsing (line 263), but
publication uses the default 500-character limit (line 462). Poster destinations
also pass through different URL predicates.

Separate one parser per document family from publication-only completeness and
business checks. Share explicit limits and the intended URL/media policies.
Preserve observable rules initially; resolve any inconsistent limits as explicit,
tested corrections rather than silently relaxing them during extraction.
Keep the current validator approach; adding a schema library is unnecessary.

### R6 — Editor and media-picker behavior is difficult to trace in one view

**P2, state ownership.**
[RecordEditor.tsx](../../remake/src/components/admin/RecordEditor.tsx) combines
navigation protection, document/saved state, several mutations, conflict recovery,
cache retry, form dispatch and layout in 461 lines.
[MediaPicker.tsx](../../remake/src/components/admin/MediaPicker.tsx) combines modal
lifecycle, library paging/search and two-phase upload recovery in 446 lines.

Extract focused hooks, keeping UI markup close to the screen:

- `useUnsavedChanges`: the existing unload/link/back/sign-out protection.
- `useRecordEditor`: document/saved state, operations and conflict/cache outcomes.
- `useMediaLibrary`: search, paging and stale-response protection.
- `useImageUpload`: signing, uploading, completion and completion-only retry.

Use named operation/status unions where they eliminate ambiguous strings or
contradictory states. Do not introduce a global store or state-machine dependency.
Keep a small explicit form switch. Move shared record labels out of the client
list module and use one route-family helper instead of recreating public paths.

### R7 — Module boundaries and repeated plumbing add avoidable searching

**P3, organization.** The 512-line content store owns admin writes, public SQL
projections and media persistence. Extract cohesive public-read and media modules;
keep write/version rules together and keep the cached public facade separate.
The CLI-only import applicator imports script-owned types from runtime source;
move that applicator beside migration tools, retaining shared application models
and the existing database client. Its current dependency is type-only, not proof
that migration code is sent to browsers.

The seven information layouts share a 574-line component module. Extract the
larger layout families and genuinely reused pieces as changes justify it; keep
shared CSS initially to avoid simultaneous styling churn. The galleries have
different thumbnail/paging policies. Share only their modal viewer behavior,
preserving wrapping versus clamped navigation and focus handling.

Other bounded cleanups: reuse the byte-limited JSON reader, centralize private
response headers, and place publication invalidation outside HTTP utilities.
Keep authorization and same-origin checks explicit at each operation boundary.
The existing auth policy, public cache facade and provider verification deserve
to remain recognizable.

### R8 — Contributor commands and records need one predictable path

**P2/P3, reproducibility and instructions.**
[package.json](../../remake/package.json) has no remake-owned pinned formatter or
format check; previous formatting used the Gatsby root's installed tool/config.
Local typecheck is `tsc`, while CI separately runs Next route type generation.
This is check drift, not an established clean-checkout compiler failure.
The generator emits differently formatted TypeScript from the checked-in output.

Add a pinned formatter with `format`/`format:check`, one local/CI fast `check`
command including type generation/typecheck/unit tests, and deterministic static
regeneration with a check/output mode. Use one CLI environment loader, preserving
process-variable precedence and secret-safe output. Keep service configuration
lazy so public checks do not require OAuth or upload credentials.
Run full regeneration comparisons only when an authorized private export is
supplied; CI checks the committed public data against its approved baseline.

Replace historical blanket implementation authorization in
[AGENTS.md](../../remake/AGENTS.md), line 14, with durable boundaries and links to
the latest content rule. Preserve the generated Next guidance. Keep current
status/launch requirements in the overview, detailed dated evidence in its owning
record, and setup commands in the application README. Link instead of repeating
large verification lists. The stale current archive wording in the implementation
plan was corrected during this documentation review.

Remove unused direct dependencies such as `zod` only after checking usage/lockfile
effects. Remove the one-line migration rich-text forwarding module when updating
its callers. Leave the audited SQL parser alone; split the 997-line migration
builder by real domain responsibilities only when that makes further work safer.

## Implementation sequence and exit checks

The work followed these passes, keeping correctness fixes, file moves and
formatting identifiable. No commit or push is implied.

| Order | Work                                                                                                                       | Exit check                                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Fix atomic import version checks, then fix empty settings defaults in a separate change                                    | Deterministic real-Postgres race test; existing conflict/idempotency checks; incomplete settings cannot publish; existing data untouched |
| 2     | Portable approved-content baseline; durable agent guidance; formatter and consistent fast checks                           | Current public reading/media baseline passes; local/CI commands agree; formatting-only diff has no behavior or content changes           |
| 3     | Separate production assets, explicit static source/fallback definitions; remove unused body prose; deterministic generator | All 29 exports, 24 routes and 230 reading blocks/credits/links preserved; generation repeats without diff; missing expected source fails |
| 4     | Correlated record types; draft parsers plus publication checks; cohesive persistence/import ownership                      | Typecheck; validation/security and PostgreSQL contracts; no schema migration, new accepted payloads or publication behavior changes      |
| 5     | Editor/media operation hooks and readable views                                                                            | Admin save/preview/publish/unpublish, dirty navigation, conflicts, stale requests and completion-only retry retain existing behavior     |
| 6     | Selective information-layout/viewer extraction; remaining HTTP/CLI cleanup; current module map                             | Public/browser/accessibility checks; each gallery's own paging/keyboard/focus contract; commands and documentation match final files     |

Useful dependency order: content baseline before deleting prose; atomic import
protection before moving its implementation; correlated types before simplifying
form dispatch. Keep the remaining passes independently reviewable where possible.

## Human and agent readability conventions

- Keep the current naming, two-space indentation, CSS Modules and ordinary
  TypeScript/React. Pin formatting without a broad style/dependency migration.
- Put a blank line after a directive, after imports, between declarations, and
  between logical phases inside a function: setup, guards, transformation,
  database/network effect, result. Keep closely related fields/statements together.
- In React views, separate state/refs, derived values, effects, operations and
  render. A formatter preserves this whitespace; it does not decide the groups.
- Replace deep ternaries and repeated casts with named intermediate values or
  short exhaustive switches. Preserve straightforward loops and early returns.
- Use purpose-specific names such as `publishRecord` and `completeImageUpload`.
  Comment why a rule exists, especially source fidelity, calendar ownership,
  optimistic versions and the upload-completion boundary.
- Keep helpers beside their owning behavior. Add shared code only for repeated
  policy; avoid a miscellaneous `utils` directory, generic repository classes,
  schema-driven forms, a page-builder DSL or one component per input field.
- Make routine tasks discoverable: page layout vs approved copy, command vs
  query, raw database read vs cache, demo data vs real defaults, and CLI-only
  migration vs runtime server code. A small task should have an obvious owner.

For example, group the homepage's poster selection together, then separate the
derived news selection with one blank line. A blank line before its JSX return
makes the data preparation boundary visible without another abstraction.

## Behavior that must survive

- Static substantive copy, dates, requirements, quotations, credits and resource
  destinations; only the already-permitted gentle title/intro changes remain editorial.
- All 146 magazine articles, ten initial summaries and six more per click,
  summary-only payloads, and private news/history boundaries.
- Atomic draft/public snapshots, reserved paths, news/event route-family
  uniqueness, version conflicts and quarantined historical records.
- Bratislava calendar/DST behavior, Sunday–Sunday presentation, correct week
  ownership and fallback without invented times or intentions.
- Exact verified-email access, same-origin writes, private preview responses,
  canonical admin origin and missing-configuration failure behavior.
- Signed upload identity/metadata verification, size/type restrictions,
  completion-only retry, shared originals and image fallback accessibility.
- A database write that succeeds followed by a cache failure must still report
  the saved record and allow cache retry without publishing twice. CLI imports
  still require the documented explicit cache refresh.

## Verification and completion

Use focused checks for each pass, then the existing integrated checks after the
last structural change. Keep content fixtures/public baselines in CI, isolated
PostgreSQL databases for mutation tests, and owned browser-server processes.
Use separate Playwright artifact directories for concurrent runs. Routine checks
must not require the private dump, real provider secrets or remote writes.

Do not rerun live Cloudinary uploads, provision databases, import hosted data or
deploy merely to verify formatting/file moves. Full provider/cutover acceptance
remains in [operations](../../remake/docs/operations.md). Earlier baseline results and the new regression results are recorded in
[implementation evidence](plan.md#verification-record). The importer races now
have deterministic real-PostgreSQL reproduction coverage.

Done means the prioritized changes have smaller, clearly owned code paths,
content/behavior checks pass, and instructions point to the actual owners and
commands. Fewer lines or more files alone do not establish improvement.

## Completion record

| Finding | Implemented owner / result                                                                                                                                                                          |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1      | `scripts/migration/apply-import.ts`: observed-version SQL condition and same-ID insert conflict, counters updated only after a successful write; deterministic editor save/publish and insert races |
| R2      | `content-store.ts`: blank settings facts and empty lists; incomplete settings cannot publish; existing settings unchanged                                                                           |
| R3      | `assets.ts`, explicit information `contentSource`, removed unreachable body prose; independent 29-record/24-route/230-block baseline and deterministic generator                                    |
| R4      | `ContentDocumentMap`, correlated `ContentRecordFor<K>` union, exhaustive admin form/preview dispatch and compile-time negative cases                                                                |
| R5      | `validation/{shared,editorial,bulletin,settings}.ts`; parsing reused by publication, explicit unchanged draft/publication policy boundaries                                                         |
| R6      | Four focused hooks under `components/admin/hooks/`, shared record labels/routes, Tiptap extension ownership; retained conflict/cache/upload outcomes                                                |
| R7      | Public/media stores, CLI-only import applicator, selective information layouts, shared modal behavior, bounded JSON reader/private headers and separate publication cache                           |
| R8      | Remake-owned pinned formatter, one local/CI `check`, lazy CLI environment loader, deterministic export check/output, durable agent guidance and linked status records                               |

The SQL parser and migration builder remain recognizable; no artificial domain
framework or schema migration was added. The obsolete rich-text forwarding module
and unused direct Zod dependency were removed. Existing limits, draft/publication
behavior, auth and provider verification remain explicit.

Integrated verification passed: shared fast check (69 unit tests plus one skipped
opt-in database suite), production build, seven real-PostgreSQL tests, 17 admin
flows, 15 public/content flows and 12 real-data accessibility cases. Static export
regeneration was byte-identical; the approved baseline is independent of the
generator. Read-only local route/privacy/pagination and editorial viewer checks
also passed. Exact scope and remaining launch limits are in the
[dated verification record](plan.md#verification-record).
