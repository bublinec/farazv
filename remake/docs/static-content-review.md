# Static content fidelity review

[Route map](routes.md) · [Decisions](../../docs/remake/decisions.md)

Reviewed **31 October 2026** against the private SQL snapshot, the legacy Gatsby
renderers, and all 24 current static URLs on `farazv.sk`. All 24 old URLs and
their local remake counterparts returned 200.

## Content policy

Preserve substantive source wording, requirements, quotations, dates, names,
historical details and credits. Layout changes and gentle title/introductory
description edits are allowed. Do not summarize away requirements, generalize
times, add unapproved factual guidance, or reinterpret dated source copy.
Reading-copy changes require an explicit editorial request.

## Checked

| Pages                                 | Result                                                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Six sacraments and `/birmovanci`      | All source reading sections retained, including theology/citations, eligibility, documents, practical instructions and preparation dates |
| Three church histories                | Full wording, historical dates, people, captions and credits retained                                                                    |
| School                                | Original history, statistics and descriptions retained                                                                                   |
| Four substantive community pages      | Original introductions, practical details, history and photographs retained                                                              |
| Gallery and virtual tour              | Photographs, collection credits and safe resource links retained; unsafe old tour destinations remain disabled                           |
| Contact                               | Existing source-backed shared settings retained; this review did not alter database contacts/hours                                       |
| Three empty community pages           | Neutral “Obsah pripravujeme.”; no invented factual body copy                                                                             |
| Calendar, family day and Objav Krista | Existing destinations retained; presentation/navigation is separate from reading copy                                                    |

The component audit covered all **146 components** referenced by the 29 published
static source records and found no omitted substantive source fields. A normalized
DOM check found all **230 expected reading blocks** in the remake. Normalization
ignores case and whitespace; source rich-text comparisons additionally checked the
substantive sacrament/history/school/community sections without rewriting them.
Image captions and resource controls can appear differently from the old HTML;
embedded URL strings are not equivalent to visible prose.

## Corrections made

- Restored the baptism paragraph's exact Thursday 19:00 preparation time.
- Removed added archive labels/advice; dated source passages remain directly
  visible and keep their original wording and order.
- Removed new explanatory body copy from the three legacy placeholder pages.
- Excluded legacy `page.content` fields from public reading copy. Gatsby used
  those fields only for SEO, and some contain editor instructions. Their private
  provenance remains intact.
- Restored the gallery's additional attribution/resource text outside its photo
  collections. A known source page cannot silently use an abridged fallback.

Detailed comparison output stays in ignored `.private/static-fidelity-live.json`.
This checks preservation; it does not certify that the parish's original facts
are current or resolve the previously recorded missing-media/unsafe-link issues.

The corrected protected Preview also passed all **24 routes / 230 reading-block
checks**, with zero missing blocks. Typecheck, the production build and the unit
suite passed (61 passed, one opt-in database suite skipped). The existing preview
aliases were updated; the live old website and database were not changed.
