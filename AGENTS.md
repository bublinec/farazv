<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Working in the root application

Read [the project overview](docs/remake/README.md) for current status and launch
requirements. Follow the user's current request; historical implementation notes
are records, not standing permission to deploy, import data or change services.
Preserve the archived Gatsby and Strapi applications in `old/` and unrelated user work.

Run commands here with Node from `.nvmrc` and this directory's lockfile. Start with
`npm run check`; see [contributor setup](README.md#checks) for database/browser
checks. Never stop or reuse someone else's development server for verification.
Use owned ports/processes, disposable local databases and distinct browser output
directories. Routine checks require no live provider credentials or remote writes.

## Code ownership

- `src/content/documents.ts`: correlated record-kind/document contracts.
- `src/server/content-store.ts`: admin commands and optimistic versions;
  `published-store.ts`: uncached public queries; `public-content.ts`: cached facade.
- `src/server/validation/`: draft parsing and publication rules by document family.
- `src/server/media-store.ts`: media persistence; `uploads.ts`: provider verification.
- `src/components/admin/hooks/`: editor, navigation, media search and upload state.
- `src/content/information.ts`: layout choices; `information-content.ts`: raw source
  reading copy; `information-updates.ts`: reviewed public corrections; `assets.ts`: real photos; `fixtures.ts`: explicit demo data.
- `src/content/page-photographs.ts`: public page-cover selection;
  `content/sacraments.ts`: shared sacrament banner and six summaries.
- `scripts/migration/`: private snapshot tooling; `scripts/environment.ts`: shared
  lazy CLI configuration. No runtime server module imports migration tooling.

## Content and behavior boundaries

Keep substantive static text, requirements, quotations, credits and resource
links unchanged unless the user requests editorial changes. The owner authorized specific expired-guidance and choir/contact corrections; see
[the reviewed corrections](docs/remake/content-refresh-2026-10-31.md). Preserve
raw provenance and evergreen/history content, and never invent new parish dates. Gentle heading/intro
edits and layout changes are allowed. Never invent parish facts or automatically
label source passages as archived. The independent baseline in
`tests/fixtures/approved-static-content.json` requires deliberate review before
updating; the export generator must never regenerate it. See
[the content review](docs/static-content-review.md).

All dates follow Bratislava date-only rules in `src/lib/calendar.ts`. Preserve
Sunday–Sunday presentation, private history, separate draft/public snapshots,
exact verified-email access, same-origin writes and completion-only upload retry.
Settings may default to the fixed parish identity from `siteConfig`; contact facts
and lists must stay empty until supplied. Fixture facts must not become real defaults.
Unpublished saves stay private; saving an already-published record updates its
public snapshot. Settings save publishes immediately. Editor access includes
configured administrators and current database-backed editor grants.

Use ordinary TypeScript/React, CSS Modules and shared tokens. Add blank lines
between setup, guards, effects and results. Extract repeated policy into focused
modules; avoid generic frameworks or helpers that hide authorization/version checks.
Keep SQL exports, credentials, account data and unpublished source records out of
fixtures and documentation. Record meaningful decisions and dated verification in
[the plan](docs/remake/plan.md); link to owning records instead of copying status.

## Parish design character

Preserve the user’s “our parish, our church” direction: genuine local photographs,
familiar church details and readable practical UI. Do not remove those accents
merely to make the site more neutral or uniform. See [the design analysis](docs/remake/design-direction.md).
The accepted design uses v2 overall but retains the original v1 homepage
hero: full-width church photograph, dark overlay, centered schedule/cards and
Ubuntu title. Keep the improved date/today semantics and minimum 44 px controls.
V2's warmer masthead, serif reading and smaller church photographs remain.
Restore page-specific original photographs in v2 headers and the original dark
stained-glass section for the six sacraments. Five stock/illustration covers use
genuine church details; supplementary news/curated-page covers also use real
church photographs. Keep those choices separate from the unchanged raw export.
Sacrament pages retain their complete original catechism quotation and attribution
exactly once, in a full-width light-blue band below the hero. The original
`window.png` banner has no recorded photographer; do not infer one from the
separate church-gallery credits. See
[D31](docs/remake/decisions.md#d31--restore-page-photographs-and-sacrament-bands-31-october-2026).
The current parish design is active for all public visitors; the former design
selector redirects to the homepage. Earlier source checkpoints remain in Git
history. Use the ignored local offline archive and the old Netlify site as visual
references; removed design-history folders are not required for a fresh clone.
