# Approved static content

`approved-static-content.json` began as the public copy approved before the
31 October 2026 refactor: 29 published source records, 24 layouts and 230 reading
blocks. Its full raw source trees preserve text, quotes, order, captions,
credits, assets and links.

The later user-authorized expiry cleanup deliberately updated four public reading
projections and removed one expired registration link. That reviewed `reading` had
224 blocks (219 unchanged and five refreshed); `sourceRecords` still contains
the original 29 raw records unchanged. `editorialReview` records the reviewed
scope. See [the editorial record](../../docs/remake/content-refresh-2026-10-31.md).

On 3 November 2026, the owner supplied updated children's choir leadership and
contacts. Its `reading` projection now names the Liečkovci couple and current
conductors, and omits the former contact paragraph; `reading` has 223 blocks.
The two replacement phone numbers are checked in `current-content-contract.ts`
against the contact card. `sourceRecords` remains unchanged; see the dated
[verification record](../../docs/remake/plan.md#2026-11-03--childrens-choir-leadership-and-contacts).

This is an independent approval record. The static export generator never writes
or updates it. Do not refresh it merely to make a failing test pass. A substantive
copy/resource/asset change requires an editorial request and a reviewed baseline
diff. Fixtures contain published content only; no private dump or provider
configuration is needed for these checks.
