<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Working in the remake

Read [the project overview](../docs/remake/README.md) for current status and launch
requirements. Follow the user's current request; historical implementation notes
are records, not standing permission to deploy, import data or change services.
Preserve the root Gatsby application and unrelated user work.

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
- `scripts/migration/`: private snapshot tooling; `scripts/environment.ts`: shared
  lazy CLI configuration. No runtime server module imports migration tooling.

## Content and behavior boundaries

Keep substantive static text, requirements, quotations, credits and resource
links unchanged unless the user requests editorial changes. The latest user
request authorized a bounded refresh of expired meetings/courses/deadlines; see
[the reviewed corrections](../docs/remake/content-refresh-2026-10-31.md). Preserve
raw provenance and evergreen/history content, and never invent new parish dates. Gentle heading/intro
edits and layout changes are allowed. Never invent parish facts or automatically
label source passages as archived. The independent baseline in
`tests/fixtures/approved-static-content.json` requires deliberate review before
updating; the export generator must never regenerate it. See
[the content review](docs/static-content-review.md).

All dates follow Bratislava date-only rules in `src/lib/calendar.ts`. Preserve
Sunday–Sunday presentation, private history, separate draft/public snapshots,
exact verified-email access, same-origin writes and completion-only upload retry.
Keep settings defaults empty; synthetic fixture facts must not become real defaults.

Use ordinary TypeScript/React, CSS Modules and shared tokens. Add blank lines
between setup, guards, effects and results. Extract repeated policy into focused
modules; avoid generic frameworks or helpers that hide authorization/version checks.
Keep SQL exports, credentials, account data and unpublished source records out of
fixtures and documentation. Record meaningful decisions and dated verification in
[the plan](../docs/remake/plan.md); link to owning records instead of copying status.

## Parish design character

Preserve the user’s “our parish, our church” direction: genuine local photographs,
familiar church details and readable practical UI. Do not remove those accents
merely to make the site more neutral or uniform. See [the design analysis](../docs/remake/design-direction.md).
V1 remains the default; v2 is an opt-in nonproduction study. The original source
checkpoint and screenshots in `docs/remake/design-history/v1/` are immutable
reference material. Content and backend behavior are shared by both variants.
