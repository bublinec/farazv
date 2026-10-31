# Current state and next steps

[Overview](README.md) · [Plan and evidence](plan.md) · [Operations](../../remake/docs/operations.md)

Reviewed **31 October 2026**, after the parish design and detail passes, and
updated for the user's choice of v2 with the original v1 homepage hero. These
recommendations do not approve a production default change, deployment or cutover.
The earlier requested commits are implementation checkpoint `797b46c` and
planning/visual checkpoint `cc40f9a`. They precede the original-hero refinement.
Nothing has been pushed by these reviews.

The remake is implemented and well checked locally. The next useful milestone is
an exact, reviewable release candidate on protected staging, followed by one real
editorial workflow. Another architecture rewrite or broad feature expansion would
delay the work that now matters most.

## What is ready

| Area            | Implemented                                                                                                                | Remaining distinction                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Public site     | Responsive routes, Sunday–Sunday schedule, notices, gallery and articles with ten initial summaries and six more per click | A real current bulletin and confirmed recurring times still need parish approval                                              |
| Parish design   | Chosen v2 composition with the original photographic hero, genuine church details, serif reading and clearer tasks         | V2 is still opt-in and disabled in production; promoting the selected composition requires a default change and verification  |
| Admin           | Slovak editing, draft/private preview/publication, conflict protection and signed image uploads                            | Live Google login and the complete hosted editor workflow remain unverified                                                   |
| Content         | 414 imported editable/history records, 146 public magazine articles, unpublished news kept private                         | Counts were reconciled previously; they do not establish final legacy-source freshness                                        |
| Static pages    | 24 custom layouts, 29 raw published source records, 224 reviewed public reading blocks                                     | Four explicit expiry corrections must be reconciled when the final source export changes                                      |
| Maintainability | Focused server/editor modules, correlated content types, independent content baseline and predictable commands             | Keep the current stack; simplify temporary design branching after the permanent design is chosen                              |
| Recovery        | Local and hosted database restore rehearsals passed                                                                        | Ongoing off-device backups, retention, operator ownership and media-original protection are not activated by those rehearsals |

The current local evidence includes 75 unit/security passes, 18 public/design/static
browser cases, eight detail flows and fixture accessibility checks. Earlier
real-PostgreSQL, admin and real-data accessibility checks cover the refactor.
The latest design captures use fixtures; neither their Mass times nor local
performance timings establish current parish facts or hosted performance.
See [verification scope](plan.md#verification-record) and
[the refined design record](design-history/v2-refined/README.md).

## Important gaps

1. **Local, committed and hosted versions need to agree.** At the start of this
   review, `remake/`, its records and CI workflow were untracked. The user then
   requested commits; implementation checkpoint `797b46c` closes the untracked
   application gap. A clean hosted CI result is still required; local checks
   and a workflow definition are separate evidence. The latest preview predates
   the locally recorded refactor/design/detail work.
2. **The production design switch is real work.**
   [`resolvePublicDesign`](../../remake/src/content/design.ts) explicitly forces
   v1 in production. The user has chosen v2 with the original hero; promotion
   still needs a small default change and a focused regression check. Keep the
   immutable v1 archive; simplify the temporary design branching after promotion.
3. **Today's Mass information has the highest content priority.** The imported
   regular template is empty. The UI honestly directs visitors to the office
   when no schedule is confirmed. Confirm the template, contacts, preparation
   arrangements and payment details, then publish a genuine current/upcoming
   weekly bulletin through admin.
4. **Final source freshness is unknown.** The authorized legacy query timed out.
   Obtain a fresh private export, compare changes, resolve target edits and plan
   the editing freeze near cutover. Review the guarded expiry projections and
   independent static baseline as part of that reconciliation.
5. **Missing images are a bounded content decision.** The previous audit found
   76 missing originals affecting eleven newly published articles. Accessible
   fallbacks work, but do not restore photographs. Review the affected articles,
   recover genuine originals where possible, and record acceptance of any
   remaining gaps. Keep five restricted, unreferenced PDFs restricted.
6. **Provider and operating workflows need actual use.** Configure and verify
   allowed/rejected Google accounts, logout/relogin and recovery. Complete a real
   hosted upload/reuse/draft/preview/publish/correction flow. Activate backups,
   retention and supported failure/usage alerts with named ownership.

## Recommended order

| Order | Work                                                                                               | Completion evidence                                                                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Check the chosen v2/original-hero composition on a real phone; prepare its explicit default change | User preference retained; Masses, notices, office contact and preparation requirements remain easy to find; focused default checks pass                        |
| 2     | Checkpoint reviewed source, run clean CI and deploy that exact candidate to protected Preview      | Identifiable commit, passing clean-run checks, selected design visible with actual database content; staging stays unindexed                                   |
| 3     | Finish Google setup and parish settings; rehearse editing                                          | Approved account signs in; unapproved account fails; upload/reuse and private/public publication work; a genuine bulletin is checked on the public site        |
| 4     | Reconcile the fresh source and affected media in parallel with staging review                      | Final content comparison, reviewed static corrections, recorded media recovery/acceptance, planned editing freeze                                              |
| 5     | Activate recovery operations and complete manual hosted acceptance                                 | Successful off-device backup and restored-app/editor check, known operator, keyboard/zoom/screen-reader review, representative phone and slower-network checks |
| 6     | Prepare the production configuration, then deliberately cut over                                   | Production auth/data/canonical URLs verified separately from Preview; robots/sitemap/indexing intentional; one real publication checked on the final domain    |

Keep legacy services until a successful real weekly publishing cycle is complete.
Rollback must account for edits made in the new admin; reverting a deployment
alone does not restore data. The detailed procedure remains in
[operations](../../remake/docs/operations.md#release-and-rollback).

The visual composition is now settled by [D30](decisions.md#d30--keep-v2-with-the-original-homepage-hero-31-october-2026).
The next bounded release-preparation run should cover its explicit default change,
source/CI checkpoint and updated protected staging. Provider setup, factual
approval and a fresh private export may need owner input; they should be explicit
dependencies rather than filled with sample data.

## Small follow-ups and deferred scope

- Explain in the editor guide that sacrament/history reading is maintained in
  code, with a clear route for requesting an approved correction. A general
  page-builder CMS is unnecessary for this release.
- Keep latest status in the overview and this assessment, detailed checks in the
  plan, and operational commands in the runbook. Preserve older evidence as dated
  history rather than presenting every result as current.
- Continue deferring PDF upload/parsing, additional roles and broad editorial
  features until actual use identifies a need. No database/framework replacement
  is justified by this review.

## Verification of this assessment

Reviewed current source, tests, workflow, Git state and existing evidence without
rerunning application suites. A fresh read-only CLI check confirmed the fixed
[preview alias](https://farazv-preview-bublinecs-projects.vercel.app) targets
deployment `dpl_4FBYLHhjnzeAVZqMXjExWJhqUq6W`; the latest three deployments are
READY and record CLI builds from a dirty working tree. This verifies deployment
metadata, not a live editor workflow or equivalence to today's local source.
The Vercel connector lacked access; the existing CLI login completed the same
scoped read-only inspection. No data import, upload, deployment or DNS change was
performed for this assessment.
