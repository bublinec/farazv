# Farazv remake

This is the durable entry point for contributors and AI agents. Last reconciled
with the implementation and discussion on **31 October 2026**.

## Status and goals

The integrated [Next.js application](../../remake/README.md) is implemented:
public layouts, a Slovak editor admin, PostgreSQL/Drizzle persistence, private
previews, publication, Google allowlist guards, Cloudinary uploads and the full
local migration. The four review records remain useful evidence; their earlier inter-stage pauses
were superseded. The maintainability refactor is implemented and locally verified. No product/design acceptance is implied by passing automated checks.

The local and hosted databases contain 414 content records, all 146 magazine
articles public, 1,081 media records and 30 static provenance records, of which 29
were published. The free Neon resource `farazv` is provisioned in Frankfurt on
PostgreSQL 18.6; hosted import counts were verified against the local database.
The new Vercel project `farazv` is linked to the owner's personal team with
`rootDirectory=remake` and Node 22. The stable [preview deployment](https://farazv-preview-bublinecs-projects.vercel.app)
is running with Vercel protection enabled; `farazv.vercel.app` is an additional alias.
**Live `farazv.sk`, its legacy stack and DNS are unchanged; production cutover
has not occurred.** The root Gatsby site and legacy backend remain available.

The remake preserves familiar parish photography and Slovak routes, makes Masses
and notices easier to find on mobile, and replaces the general CMS with a small
editorial admin. Informational pages use ordinary React layouts. The application
stays in `remake/`; Vercel can deploy that directory without moving or deleting
legacy source.

## Reading order

For the immediate priorities, read [the current-state assessment and next steps](current-state-2026-10-31.md).

1. [Contributor setup](../../remake/README.md) and [route/content map](../../remake/docs/routes.md).
2. [Architecture](architecture.md) and [decision log](decisions.md).
3. [Plan, review records and evidence](plan.md).
4. [Migration details](../../remake/docs/migration.md), [operations](../../remake/docs/operations.md)
   and [Slovak editor guide](../../remake/docs/editor-guide.md).
5. [Implementation review and completed refactor](refactor-plan.md): priorities,
   readable code conventions and behavior-preserving implementation passes.

6. [Design direction and versions](design-direction.md): familiar parish imagery,
   typography analysis, preserved v1 and opt-in v2.

7. [Reviewed current-content refresh](content-refresh-2026-10-31.md) and
   [detail pass](design-history/v2-refined/README.md): expired guidance and clearer tasks.

Check actual code and dated evidence before claiming a service, import, test or
release step has completed. Update the relevant records when decisions change.

## Audited source inventory

The ignored PostgreSQL dump is the primary content snapshot. The importer parses
`COPY` data through a content-table allowlist; it does not execute SQL or import
Strapi authentication/configuration. Counts distinguish source status from the
intentional article-publication override.

| Content            | Source total | Source published | Source unpublished | Implemented policy                                                |
| ------------------ | -----------: | ---------------: | -----------------: | ----------------------------------------------------------------- |
| Magazine articles  |          146 |               32 |                114 | All 146 imported and public                                       |
| News posts         |           92 |                6 |                 86 | Preserve status; unpublished news remains private                 |
| Weekly bulletins   |          162 |              158 |                  4 | Preserve history and status; public view uses eligible weeks only |
| Text notices       |           10 |                1 |                  9 | Preserve status and detail paths                                  |
| Events             |            3 |                1 |                  2 | Preserve status, destination and poster presentation              |
| Parish settings    |            1 |                1 |                  0 | Shared published settings, with recurring times unconfirmed       |
| Admin-page sources |           24 |               23 |                  1 | Published reading copy projected into custom layouts              |
| Other page sources |            6 |                6 |                  0 | Published reading copy projected into custom layouts              |

The first six rows produce **414 editable/history content records**. Static
provenance is stored separately. There are 28 legacy fixed paths, including the
404 design, plus preserved dynamic route families and the additional news list.

The **1,081 media records** contain 1,075 images, five PDFs and one Word document.
They are references/metadata, not an image-byte backup. Availability checks found
1,000 available originals, 76 missing originals (404), and five restricted,
unreferenced PDFs (401). Recovery remains unresolved; the private 76-row support
CSV is prepared and has not been sent. No previously public editorial record or
published static source page uses the failed assets; some newly published
magazine content does. See [media recovery evidence](../../remake/docs/migration.md#verification-and-release-limits).

## Verification records

The [dated verification record](plan.md#verification-record) owns detailed local,
hosted and provider evidence, including the refactor regression run. The
[refactor record](refactor-plan.md#completion-record) maps each review finding to
its final owner. Automated checks do not imply product acceptance, live Google
login or production cutover. Accessibility/performance methods and their limits
are in [the quality audit](../../remake/docs/quality-audit.md).

The existing local and hosted backup/restore drills passed; they do not establish
an ongoing off-device backup schedule. Activate and assign cadence, retention and
private storage ownership before release.

## Launch requirements

| Requirement            | Current state / remaining action                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google OAuth           | Credentials absent. Register the intended fixed preview callback and eventual production callback; verify allowed/rejected accounts, sign-out and recovery. See [operations](../../remake/docs/operations.md#google-access-and-recovery). |
| Hosted database        | Free Frankfurt Neon PostgreSQL 18.6 and verified import are running. Hosted backup/restore drill passed; activate ongoing encrypted off-device backups, retention and recovery ownership.                                                 |
| Final source freshness | Not established. The authorized read-only legacy check timed out without results or changes. Obtain a fresh private export, compare/reconcile and freeze editing before cutover.                                                          |
| Media recovery         | 76 missing originals remain unresolved. Preserve recovery evidence and resolve the owner recovery/acceptance decision; keep restrictions on the five PDFs.                                                                                |
| Parish facts           | Confirm contacts, dated course/event details, donor-category presentation and actual recurring Mass times. The imported regular template is empty.                                                                                        |
| Release evidence       | Final build, 12 real-data accessibility cases, six local production measurements and route/privacy/pagination/outage checks passed. Complete live Google and manual acceptance; local timings do not establish hosted Core Web Vitals.    |
| Ongoing operations     | Assign and activate backup cadence, retention, off-device storage and recovery ownership; retain old services through a successful real weekly cycle.                                                                                     |
| Deployment/domain      | A Vercel preview is running with hosted content. Verify the real callback/app/data configuration before a production deployment, enabling indexing or switching DNS.                                                                      |

## Source roles and private inputs

SQL supplies content, statuses, relationships and provenance. The existing
frontend, live pages and screenshots guide presentation and route compatibility.
Public API checks can compare published changes but cannot prove private-content
freshness. The ignored `design-reference/2026-10-20/` archive is a local reference,
not a requirement for a fresh clone. The original brief is background material;
later user decisions and authorization take precedence over its tentative plans.

Keep raw exports, credentials, unpublished material and recovery evidence in
ignored private locations. Public source-controlled informational copy includes
only published material. Existing [Gatsby instructions](../../README.md) and the
[legacy deployment diagnosis](../netlify-build-diagnosis.md) describe the old site.
