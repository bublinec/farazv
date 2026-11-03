# Operations and release

[Project setup](../README.md) · [Editor guide](editor-guide.md) · [Remake records](remake/README.md)

This runbook distinguishes implemented controls from hosted configuration still
requiring verification. Local tests do not establish working Google credentials,
automatic backups or production cutover. A separate real Cloudinary upload/completion/cleanup check
has passed; live Google OAuth is still an owner acceptance check.

As of **3 November 2026**, production is https://farazv.sk on the Vercel project
`farazv`; `www.farazv.sk` redirects to the apex. Production uses database content,
`SITE_URL` and `BETTER_AUTH_URL` set to `https://farazv.sk`, indexing enabled and
no fixed preview date. The owner confirmed the Google callback is registered;
full live Google login remains an acceptance check.

The Next.js application now lives at the repository root. Vercel must use an
empty Root Directory, Node 22, `npm ci` and `npm run build`. The previous Gatsby
client and Strapi admin are archived under `old/`, excluded from active checks
and deployment uploads. The root Netlify configuration skips automatic builds,
preserving the [previous deployment](https://farazv.netlify.app/) as a historical reference.
A [fixed build URL](https://6ad71e314cf8202580e1a791--farazv.netlify.app/) is also retained. No DNS change is needed for
this repository cleanup.

Deploy with an explicit Vercel environment. Preview variables and production
variables are separate; local fixture verification does not prove hosted data
or credentials. Historical deployment evidence remains in the dated plan.

## Ownership and configuration

Juraj Bublinec is the selected project owner. Record a backup
operator, alternate service owner and recovery instructions in the team's private
password manager. Keep credentials and the editor allowlist out of repository documentation.
Store private handover documents separately from the source tree.

Use separate development, fixed staging and production databases. Staging needs
a stable domain for its exact Google callback. Production uses
`CONTENT_SOURCE=database`, the intended HTTPS `SITE_URL`, and the same origin in
`BETTER_AUTH_URL`. Keep `SITE_INDEXING_ENABLED` unset/`false` until launch and
`PREVIEW_DATE` empty in production. Staging remains unindexed.

`npm run env:check` prints only key names and validity. Add `-- --production` for
a release candidate and `-- --production --launch` only when intentionally
enabling indexing. It validates configuration shape, not provider credentials.

## Repeatable local checks and CI

The repository workflow [checks.yml](../.github/workflows/checks.yml)
runs a clean locked dependency install, route type generation, typecheck, unit and
security tests, a production build, public browser/accessibility tests, PostgreSQL integration
tests and authenticated editor browser tests. It uses an ephemeral PostgreSQL
service, read-only repository permissions and no production secrets or deployment
step. The public browser server explicitly uses `CONTENT_SOURCE=fixtures`, so a
developer's database-mode `.env.local` cannot silently change that suite.

For local database-backed checks, provide `TEST_POSTGRES_URL` privately with a
loopback PostgreSQL connection whose user can create databases. A loopback
`DATABASE_URL` is accepted as a fallback; remote URLs are refused before contact.
Next owns a single `.next/dev/lock`. If another development server is running,
leave it alone: build an owned preview and use
`ADMIN_E2E_SERVER=production npm run test:admin`. The test runner never stops or
reuses another server.

```sh
npm run test:integration
npm run test:admin
```

Each command generates a new test database name and refuses an existing target.
The integration runner migrates and tests publication, concurrency, route
uniqueness and import behavior. The admin runner migrates an empty database,
starts its own loopback Next process, runs the editor browser suite, and cleans
up that process group and database after success, failure or normal interruption.
It supplies visibly test-only Google provider fields and a fresh random session
secret in child-process environment variables. The helper signs actual Better
Auth session cookies; no runtime application bypass is added. Cloudinary private
credentials are cleared, with upload UI responses mocked. These checks therefore
verify editor/session behavior, not a live Google callback or actual upload.

CI action versions are pinned to official release commit SHAs checked on
2026-10-31: [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1)
and [setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0).
The service image is the versioned `postgres:17.11-bookworm` tag listed by the
[official image manifest](https://github.com/docker-library/official-images/blob/master/library/postgres).
Update these pins deliberately after reviewing upstream changes.

The [accessibility and performance audit](quality-audit.md) records representative
WCAG rule checks, corrected findings, reproducible local measurements and their
limits. These checks complement manual keyboard, screen-reader and content
review; local lab timings do not establish hosted Core Web Vitals.

## Public production checks and search ownership

Run `npm run verify:production` after release, or add `-- --all-pages` to crawl
every sitemap destination. The [production smoke workflow](../.github/workflows/production-smoke.yml)
runs these read-only checks after successful main-branch CI, successful
Production deployment events, and manual dispatch. It requires no production secrets. This is release verification,
not continuous uptime monitoring. Search Console verification support and the
remaining backup/monitoring tasks are in [production readiness](production-readiness.md).

## Google access and recovery

Create a Google OAuth **Web application** client in the owner's Google Cloud
project. Register `<BETTER_AUTH_URL>/api/auth/callback/google` for each fixed
environment, including the exact scheme, hostname and port. Configure the consent
screen and test users as required by that project. Set server-only
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET` (32 random
characters minimum), `BETTER_AUTH_URL`, and `ADMIN_EMAIL_ALLOWLIST`. Generate the
secret privately, for example with `openssl rand -base64 32`. The allowlist accepts
comma/newline-separated exact email addresses with normalized case, no wildcards.

The intended fixed preview callback is
`https://farazv-preview-bublinecs-projects.vercel.app/api/auth/callback/google`.
Use that stable alias as `BETTER_AUTH_URL`; the additional alias does not become
a callback automatically. Production Google credentials are configured and the
owner confirmed the production callback. The protected preview and local
real-cookie tests do not establish a completed live Google login.

On Vercel (`VERCEL=1`), GET/HEAD visits to `/admin` and its page descendants on
another alias redirect temporarily to the configured HTTPS `BETTER_AUTH_URL`,
preserving the path and query. This includes login, record and private-preview
entry links. Canonical-origin visits continue normally; local development is
unchanged unless Vercel mode is explicitly enabled. A malformed/non-HTTPS base
does not supply a redirect destination. The destination origin comes only from
server configuration, never a query, Host or forwarded-host parameter. API paths
and mutations are not redirected; verified sessions and strict same-origin
checks remain mandatory. After changing aliases, check alternate-host page
redirects and the canonical login before verifying the real Google callback.

The Next.js server proxy also consolidates public production aliases onto
`SITE_URL` with a permanent redirect, while leaving preview page navigation usable.
It is a navigation aid, not an access boundary.
Helper/proxy tests verify path/query preservation, invalid configuration,
no external destination injection, canonical/local behavior and unchanged API
mutations. References: [Next.js proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy),
[request headers](https://nextjs.org/docs/app/api-reference/functions/headers).

Better Auth validates Google OAuth and uses encrypted, signed eight-hour sessions
without an authentication database. Every protected request requires a verified
email and a current role. `ADMIN_EMAIL_ALLOWLIST` defines administrators in Vercel
configuration; changing it requires redeployment. Administrators manage additional
editors in `/admin/pristupy`, backed by `editor_access`. Grants are checked without
caching on every request: revocation denies existing editor sessions immediately.
There is no public signup, local password or access bypass. Private visitor feedback
and access management are restricted to administrators.

If an editor loses their Google account, an administrator revokes that grant and
adds the replacement verified Google address. This does not send an invitation
email. If all administrators are locked out, the project owner updates the correct
Vercel environment's allowlist and redeploys. Keep Vercel/Google recovery methods
accessible to a trusted alternate. Rotating `BETTER_AUTH_SECRET` invalidates all
sessions. Do not reuse old Strapi credentials. Verify a permitted login, rejected
account, sign-out and fresh login on the intended environment. References:
[stateless sessions](https://better-auth.com/docs/concepts/session-management#stateless-session-management),
[Google callbacks](https://better-auth.com/docs/authentication/google).

## Cloudinary

Retain existing originals and public identifiers. Set server-only
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. New images
use `farazv-remake/YYYY/MM/` public IDs and cannot overwrite old assets. Editors
can reuse imported images or upload JPG/JPEG, PNG, WebP, AVIF and GIF up to 10 MB,
with alternative text. SVG, PDF and video are outside this upload flow.

The authenticated, same-origin signer fixes the upload fields. Cloudinary accepts
its timestamp signature for **one hour**; the application's editor-bound
completion ticket expires after **five minutes**. The browser checks file size
for feedback. Before registration the server verifies the response signature and
independently reads provider metadata for identity, type, dimensions and actual
bytes. Cloudinary has no per-preset size limit; an oversized direct upload may
exist there but cannot be registered by this flow. Completion can be retried
within the ticket window. Detaching an image does not delete its original.

On 31 October 2026 a separate live smoke check passed a real signed upload,
independent metadata lookup, completion validation and removal of its generated
temporary asset. Existing media were not changed. The browser suite separately
checks upload preview/retry behavior with mocked provider responses. Complete the
real editor-to-publication/reuse flow on the fixed staging domain before launch.
Run `npm run media:verify -- --confirm-live-upload` only when intentionally
creating and removing one temporary provider asset; it is excluded from CI.
Review abandoned new uploads manually; never bulk-delete the old shared library. References: [signature lifetime](https://cloudinary.com/documentation/authentication_signatures),
[preset limitations](https://cloudinary.com/documentation/upload_presets).

## Refresh after a command-line import

Editor publication invalidates the public cache immediately. A command-line
import writes PostgreSQL directly and cannot invalidate Next's cache from that
process. After applying a hosted import, purge this project's data cache before
reviewing the result:

```sh
vercel cache purge --type data --project farazv --scope bublinecs-projects --yes
```

An authenticated admin revalidation request is another option. Without explicit
invalidation, the five-minute cache can serve a stale response while refreshing.
Recheck public summary/body output after the purge. This was verified against
the hosted excerpt correction; a new deployment alone did not remove old cached
summaries. Keep deployment protection and editor authorization enabled.

## Backup and restore

Install PostgreSQL client tools matching or newer than the source server's major
version. `PG_DUMP_BIN`/`PG_RESTORE_BIN` can select their installed binaries. Scripts
read `.env.local` then `.env` without replacing process variables. Prefer a direct
`BACKUP_DATABASE_URL` when the application's `DATABASE_URL` uses a pooler.
URLs/credentials are never passed in command arguments or printed. PostgreSQL
receives connection fields through its child-process environment.

```sh
npm run db:backup -- --output .private/backups/pre-release.dump
```

Backup creates a compressed custom archive with permissions `0600`, refuses an
existing file, and rejects paths outside ignored `.private/` or escaping symlinks.
Copy it to an encrypted off-device destination accessible to the recovery
operator. Archives contain drafts, history and published snapshots, but only
references to Cloudinary images. Separately retain the media account and verify
its original-file backup/export arrangement.

Proposed policy to assign and activate before launch: daily backups plus a backup
before migration/release; retain seven daily and four weekly encrypted archives;
rehearse restoration quarterly and after schema changes. The code installs no
scheduler or retention cleanup. Record the actual schedule, owner, destination,
last successful backup and restore drill privately.

For a drill or recovery, pre-create a **separate empty database**, set
`RESTORE_DATABASE_URL` privately, and retain the source URL for comparison:

```sh
npm run db:restore -- --input .private/backups/pre-release.dump --target-name farazv_restore_check
```

Restore rejects the source database, a target containing user objects, or a
group/world-readable archive. It runs in one transaction, stops on errors and
never drops a database or uses `--clean`/`--create`. Only restore trusted archives.
Use another empty target after a failed attempt. Compare counts, identities,
public/private status, complete bodies/media, weekly selection and settings;
then run the application and editor publication against the restored target
before changing a live connection. Keep the source intact. References:
[pg_dump archives](https://www.postgresql.org/docs/14/app-pgdump.html),
[pg_restore](https://www.postgresql.org/docs/14/app-pgrestore.html).

Local drill on **2026-10-31**: created a private custom archive from the isolated
development database, restored into a newly created separate database, and
matched sorted-row aggregate hashes across all five tables (1,527 rows).
A repeated restore correctly refused the now-nonempty target. The temporary
target was removed; the source remained intact and the private archive was kept.
This verifies the local tools and safeguards, not an off-device backup schedule
or a hosted Neon recovery drill.

Hosted drill on **2026-10-31**: the actual replacement Neon PostgreSQL 18.6 source
was backed up with matching 18.6 clients into a private 887,756-byte archive.
The official Homebrew client/runtime bottles were SHA256-verified and extracted
only under ignored `.private/tools/`; no system installation or daemon start
was needed. `PG_DUMP_BIN`/`PG_RESTORE_BIN` selected those clients with a private
runtime-library path.

The archive restored into a uniquely named database whose absence was checked
before creation. Canonical sorted-row hashes matched across all five tables and
1,530 rows: 414 content, 1,081 media, 30 static sources, three import runs and two
schema migrations. Column/index/sequence hashes also matched. The source's
before/after hashes were identical. Both source-target identity and nonempty-
target refusals passed, without changing the restored target. Only the database
created by this drill was removed, and its absence was verified. The archive and
aggregate evidence remain private.

This completes the hosted archive/data recovery rehearsal. It does not activate
an ongoing backup schedule, encrypted off-device storage or retention, and it
does not establish a full hosted application/editor recovery exercise. Keep those
operational acceptance tasks separate from the verified archive/hash checks.

## Release and rollback

1. Review public design, editor workflow, migration reconciliation and release
   checks. Confirm actual parish contacts and recurring Mass times.
2. Rehearse the current dump import on staging: 146 public magazine articles,
   original unpublished news private, historical bulletins private-only. Review
   reported anomalies and representative complete bodies and images.
3. Freeze old-CMS editing for an agreed window. Take a fresh private source dump,
   back up the new database, and reconcile the final delta. The repository's
   historical dump alone cannot prove launch-day freshness.
4. Verify real OAuth/upload, restored backup, anonymous draft rejection, routes,
   redirects, canonical URLs, and Sunday/midnight behavior. Confirm ownership.
5. After release-owner approval of that candidate, deploy the intended app/data
   pair, enable production indexing and switch the domain/DNS. Recheck robots,
   sitemap, public pages and one real publication on the production domain.
6. Retain old deployment, database and media through a successful real weekly
   publishing cycle. Record deployment IDs, DNS values, times and source version.

The authorized read-only legacy freshness check on 31 October 2026 timed out
without results or changes. It does not establish a current snapshot and does
not replace the fresh-export/reconciliation step.

On failure, freeze editing before moving traffic. Back up the current new database
and reconcile edits since cutover before returning to the old system; otherwise
new intentions/articles can be lost. Restore the previous deployment/DNS and
matching configuration. A deployment rollback does not restore data. A data
rollback uses a separate restored database and validation, never overwrites the
only current copy. Reopen exactly one editor system after reconciliation.

## Service limits

Primary sources checked **2026-10-31**; the actual account plan governs. Monitor
usage, database/authentication/upload failures without logging secrets or private
content. Activate supported alerts and regularly review dashboards.

| Service                          | Free-tier constraints to verify before release                                                                                                                                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neon                             | 100 CU-hours/project, 1 GB/project storage, 5 GB/project public transfer, scale-to-zero after five minutes, six-hour history and one manual snapshot. Keep independent backups. [Plans](https://neon.com/docs/introduction/plans)                                                  |
| Vercel Hobby                     | Personal, noncommercial use: verify eligibility for parish production. Included usage lists 100 GB fast transfer, one million function invocations and four CPU-hours; exhausted limits can pause service. Confirm the selected plan. [Hobby](https://vercel.com/docs/plans/hobby) |
| Cloudinary Image/Video APIs Free | 25 shared monthly credits, three dashboard users. Storage, transformations and delivery share credits rather than each receiving an independent allowance. [Pricing](https://cloudinary.com/pricing)                                                                               |

These scripts create no paid subscription, external backup schedule or DNS change.
