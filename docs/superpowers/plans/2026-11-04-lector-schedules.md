# Lector schedules implementation plan

> **For agentic workers:** Use executing-plans to implement this plan task by task.

**Goal:** Add private monthly lector PDFs, a restricted LEKTORKA role and editable roles.
**Architecture:** Separate private PostgreSQL records and bounded PDF endpoints from public content. Keep Google CMS authentication. Check current role and document authorization on every request.
**Tech stack:** Existing Next.js/React/TypeScript, CSS Modules, Drizzle/PostgreSQL, Node crypto.
**Spec:** ../specs/2026-11-04-lector-schedules-design.md

## Constraints

Only `filip/upravy`; no main changes, merge, deploy, remote database writes or legacy changes.
Preserve existing static content, public snapshots and Google login. Password entered once, 8–128 characters.
PDF at most 3 MB. Current/next month follows Bratislava. Visitor authorization lives only in tab memory.
Native execution in the existing requested checkout; final independent review after implementation.

## Review focus

- Existing API/page authorization must reject LEKTORKA, including uploads and previews.
- Password changes racing with unlock must not mint a token for the new password.
- Concurrent replace/delete must not lose a newer file; include version conditions.
- December and Bratislava midnight must switch eligible months correctly.
- Authentication secrets/PDF bytes must never enter public content, cache, URL or logs.

## Task 1: Roles and capabilities

Files: content/editor-access.ts, lib/auth-policy.ts, server/editor-access.ts, server/auth.ts,
server/admin-http.ts, admin pages/layout/navigation, EditorAccess and editors API.
Interfaces: EditorRole = admin | editor | lektorka; capability checks for content, schedules, administration.

- [x] Add failing pure role-policy tests and observe RED.
- [x] Add role column, protected account policy and auditable role changes; preserve editor grants.
- [x] Split member authentication from content authorization; deny restricted role in existing routes/pages.
- [x] Add role selector and restricted navigation; Google flow remains unchanged.
- [x] Run role tests GREEN and existing authentication tests.

## Task 2: Private storage and validation

Files: content/lector-schedules.ts, lib/lector-schedules.ts, server/lector-validation.ts,
server/lector-crypto.ts, server/lector-store.ts, server/lector-access.ts, db/schema.ts and migration.
Interfaces: current/next month list; list/save/delete versioned schedules; password status/change;
unlock returns opaque token; verify token before list/PDF reads.

- [x] Add failing tests for months/year rollover, PDF validation, password and token hashing.
- [x] Implement focused modules, 3 MB bounded reading, private bytea, scrypt, atomic rate limits,
      12-hour hashed sessions, password-revision race checks and expired-record cleanup.
- [x] Add database constraints, migration journal/snapshot using pinned tooling.
- [x] Test migration, replacement conflicts and password/session revocation in disposable local database.

## Task 3: APIs and CMS

Files: api/admin/lectors/**, api/lectors/**, admin/lektori, admin/nastavenia,
components/admin/LectorSchedules and LectorPassword.

- [x] Add failing HTTP integration tests for role denial, no-token PDF denial, origin, body bounds,
      password change, direct URLs, stale writes and rate limits.
- [x] Implement APIs with private headers, no credential query parameters and explicit guards.
- [x] Build CMS month upload/replace/delete/preview and private password panel with one password field.
- [x] Verify negative and positive paths GREEN.

## Task 4: Public modal

Files: components/information/CommunityAside.tsx, OfficeAside.tsx and new lector component/CSS.

- [x] Add failing browser tests for button placement, keyboard dialog, errors and session lifetime.
- [x] Add button only on lector page and accessible native dialog. Hold token only in component memory;
      reset on pagehide/reload, revoke blob URLs, provide open/download and lock actions.
- [x] Test desktop/mobile, focus return, new tab/reload and accessibility.

## Task 5: Finish and document

Files: tests, docs/editor-guide.md, docs/remake/plan.md, dedicated lector changelog.

- [x] Run npm run check, fixture build, integration/admin suites and relevant public/browser regressions.
- [x] Inspect desktop/mobile in one batch, fix defects together, confirm once.
- [x] Obtain fresh whole-change review; resolve material findings with regression tests.
- [x] Record actual evidence, limits, migration and user instructions in changelog.
- [x] Verify diff and branch. Delivery is limited to HEAD:refs/heads/filip/upravy; no main or deployment.

## Execution ledger

4 November 2026: User explicitly authorized implementation only on filip/upravy after proposal.
User correction: password entered once, minimum 8 characters, Google CMS login unchanged.
Ruling: Work in current filip/upravy checkout; branch restriction takes priority over new worktree naming.
Baseline pending correct Node runtime. No application code changed yet.

### 5 November 2026 continuation and verified ledger

- User correction: administrators stay exclusively in the existing environment allowlist;
  CMS grants are only editor or lector. No new Google login mechanism.
- Task 1: role policy and all existing API denial tests GREEN. CMS admin-promotion
  test was observed RED, then GREEN after restricting both runtime grant validation
  and the database constraint. Existing grants default to editor.
- Task 2: month/year rollover, PDF bytes/stream bounds and password tests GREEN.
  Disposable PostgreSQL integration: 11 passes, including forced password-rotation
  overlap, replace/delete overlap, expired sessions, private history and rate limits.
- Task 3: whole CMS browser suite: 19 passes, including account roles, restricted
  pages, two month uploads, shared password, actual PDF download and role revocation.
- Task 4: public browser/regression/accessibility suite: 50 passes, one opt-in
  migrated-image fallback case skipped. Keyboard focus regression was observed RED
  and is GREEN after focusing the unlocked result and announcing success.
- Task 5: npm check: 92 passes and two opt-in integration skips; fixture build GREEN.
  Existing isolated content-store integration: 7 passes. Changelog and editor guide added.
- Fresh read-only reviewer reported no Critical/Important auth, storage or concurrency
  defect and identified missing forced-race tests plus the focus issue. Both were
  addressed. Its final formal report was unavailable after a tool/runtime usage limit;
  the delivered review conclusions and direct test evidence are retained here.
- Ruling: the new lector-only mobile header will wrap branding and utility controls
  independently — visual inspection showed overlapping text; other roles retain
  their existing layout. Cost if wrong is confined to the new role's header.
- No production/provider writes, source-content edits, account migration or main changes.
- Delivery instruction: commit this verified tree and push explicitly to `HEAD:refs/heads/filip/upravy`; stop owned test processes before handoff.

- Final header regression: rendered logo/utility overlap observed RED, then GREEN
  after a lector-only wrap adjustment at 390 and 320 px. The full lector PDF/role
  workflow passed again on the final compiled build. Final npm check: 92 passes,
  two opt-in skips; final fixture build passed. Manual acceptance with Juraj remains.
