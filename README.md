# Parish website

The Next.js public site and integrated Slovak admin run from this repository root.
The production site is https://farazv.sk, hosted on Vercel. The previous Gatsby
client and Strapi admin are archived in [`old/`](old/README.md).
Content inventory and historical launch records are in the [project overview](docs/remake/README.md).

[Architecture](docs/remake/architecture.md) ·
[Plan and evidence](docs/remake/plan.md) ·
[Refactor record](docs/remake/refactor-plan.md) ·
[Decisions](docs/remake/decisions.md) ·
[Routes](docs/routes.md) · [Migration](docs/migration.md) ·
[Production readiness](docs/production-readiness.md) ·
[Operations](docs/operations.md) · [Editor guide](docs/editor-guide.md)

## Run locally

Use Node **22.23.4** (`.nvmrc`) and npm **10.9.9**. Run commands in this directory
with its own package manifest and lockfile.

For a public design demo without private data or service credentials:

```sh
npm ci
CONTENT_SOURCE=fixtures npm run dev -- --port 3100
```

Open <http://localhost:3100>. Fixture mode contains public article examples,
shortened sample text and a visibly labeled synthetic schedule. It is an explicit
nonproduction demo. Set optional `PREVIEW_DATE=2026-10-31` to reproduce the design
date. Cloudinary images need network access; Ubuntu fonts are local.

For real content, copy `.env.example` to ignored `.env.local`, configure an
isolated PostgreSQL database and set `CONTENT_SOURCE=database`. Missing Google
configuration denies editor access while public pages can read published data.

```sh
npm run db:migrate
npm run content:check -- --dump db-backup/dump.sql --dry-run
npm run content:import -- --dump db-backup/dump.sql --apply
npm run dev -- --port 3100
```

Use only an authorized private export and the intended replacement database.
The importer parses allowlisted content without executing SQL or importing old
accounts. Read [migration behavior](docs/migration.md) before applying a snapshot.
After a CLI import, explicitly refresh the public cache as documented there.
The shared CLI loader preserves process variables before `.env.local` and `.env`.

For a compiled local preview, run `npm run build`, then
`npm run start -- --port 3103`. Keep indexing disabled. See
[Google setup](docs/operations.md#google-access-and-recovery) for the fixed preview
origin/callback and private configuration; deployment access and editor access
are separate.

## Checks

```sh
npm run check                 # formatting, Next route types, TypeScript, unit/security tests
npm run build
npm run test:browser -- tests/browser/public.spec.ts tests/browser/static-content.spec.ts tests/browser/design.spec.ts tests/browser/details.spec.ts tests/browser/seo.spec.ts
npm run test:accessibility
npm run test:integration
npm run test:admin
npm run verify:production     # read-only health/SEO checks against the public site
```

`npm run format` applies the pinned formatter. `npm run typecheck` always generates
Next route types first. Local and [CI](.github/workflows/checks.yml)
fast checks use the same command; CI needs no production credentials or deployment.
Dated results and their scope live in the [verification record](docs/remake/plan.md#verification-record).

Public browser tests start an owned fixture development server and refuse to reuse
an existing server. If another Next development server owns `.next/dev/lock`, use
an owned compiled server instead:

```sh
CONTENT_SOURCE=fixtures npm run start -- --port 3103
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3103 PLAYWRIGHT_EXTERNAL_SERVER=1 npm run test:browser -- tests/browser/public.spec.ts tests/browser/static-content.spec.ts tests/browser/design.spec.ts tests/browser/details.spec.ts tests/browser/seo.spec.ts
```

Set `PLAYWRIGHT_OUTPUT_DIR` to a distinct directory when running suites concurrently.
On macOS the tests use installed Chrome when available; otherwise run
`npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Integration/admin runners require private `TEST_POSTGRES_URL` pointing to
loopback PostgreSQL with database-creation permission; a local `DATABASE_URL` is
a fallback. They create and remove their own databases/processes. Admin tests use
real Better Auth cookies and test-only provider configuration; they do not prove
live Google login. Upload UI responses are mocked. After building, use
`ADMIN_E2E_SERVER=production npm run test:admin` to avoid a development-server lock.

Live provider checks, backup/restore and release acceptance are deliberate
operational commands in [the runbook](docs/operations.md), separate from routine
regression tests.

## Local storage

The active app's dependencies stay in root `node_modules/`. Legacy applications
under `old/` retain source and lockfiles; install their dependencies only if needed.
Build caches (`.next/`, `.next-preview/`, `old/client/.cache/`), legacy generated
`old/client/public/`, browser results and `.playwright-mcp/` are disposable when no
app or test server is running. After removing `.next/`, build before using `npm start`.

The ignored local `design-reference/2026-10-20/index.html` retains offline copies
of all 31 original pages and six representative full-page screenshots. Preserve
source assets, private configuration, database backups and the local admin Git
history backup; they are not disposable caches.

## Compare design versions

The original design remains the default. On a running local/nonproduction instance,
open `/design` for the comparison, `/design/v2` for the warmer parish study, or
`/design/v1` to return. Selection carries through ordinary public pages in this
browser; admin stays unchanged. The selector is disabled on Vercel production.

See [the design analysis](docs/remake/design-direction.md) and
[preserved source/screenshots](docs/remake/design-history/README.md).
To run public checks in the second variant, set `PLAYWRIGHT_PUBLIC_DESIGN=parish`.

## Find the owner of a change

| Task                                           | Owner                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Edit route/layout/metadata                     | `src/app/`, `src/components/`                                                       |
| Change approved static copy vs presentation    | `src/content/information-content.ts` vs `information.ts`, `components/information/` |
| Select real photos vs demo examples            | `src/content/assets.ts` vs `fixtures.ts`                                            |
| Change persisted/editor contracts              | `src/content/documents.ts`                                                          |
| Change admin write/version policy              | `src/server/content-store.ts`                                                       |
| Change draft parsing/publication rules         | `src/server/validation/`                                                            |
| Change public SQL vs cache/error fallback      | `src/server/published-store.ts` vs `public-content.ts`                              |
| Change media persistence vs provider checks    | `src/server/media-store.ts` vs `uploads.ts`                                         |
| Change editor/search/upload/navigation state   | `src/components/admin/hooks/`                                                       |
| Change date/week ownership                     | `src/lib/calendar.ts`                                                               |
| Change private migration/configuration tooling | `scripts/migration/`, `scripts/environment.ts`                                      |

Static export regeneration is deterministic and requires a private dump:

```sh
npm run content:generate:check -- --dump db-backup/dump.sql
npm run content:generate -- --dump db-backup/dump.sql --output .private/information-review.ts
```

Raw source generation and reviewed current-copy corrections have separate owners;
see [the content refresh](docs/remake/content-refresh-2026-10-31.md).
The generator never rewrites the independent approved-content baseline. Routine CI
compares all public records/layout definitions against that committed baseline;
review actual editorial changes before deliberately updating it.

Never commit `.env*` secrets, `.private/`, `db-backup/`, account data or raw exports.
The [code licence](LICENSE), parish text/photo rights and
[Ubuntu Font Licence](public/fonts/UFL.txt) are separate. Preserve credits;
Cloudinary availability is not a licence grant.
