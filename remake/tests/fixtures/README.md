# Approved static content

`approved-static-content.json` began as the public copy approved before the
31 October 2026 refactor: 29 published source records, 24 layouts and 230 reading
blocks. Its full raw source trees preserve text, quotes, order, captions,
credits, assets and links.

The later user-authorized expiry cleanup deliberately updated four public reading
projections and removed one expired registration link. Current `reading` has
224 blocks (219 unchanged and five refreshed); `sourceRecords` still contains
the original 29 raw records unchanged. `editorialReview` records the reviewed
scope. See [the editorial record](../../../docs/remake/content-refresh-2026-10-31.md).

This is an independent approval record. The static export generator never writes
or updates it. Do not refresh it merely to make a failing test pass. A substantive
copy/resource/asset change requires an editorial request and a reviewed baseline
diff. Fixtures contain published content only; no private dump or provider
configuration is needed for these checks.
