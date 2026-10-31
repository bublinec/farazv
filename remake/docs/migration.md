# Content migration

[Contributor setup](../README.md) · [Remake plan](../../docs/remake/plan.md)

After applying to a running app, follow the [cache refresh procedure](operations.md#refresh-after-a-command-line-import)
before checking public output. Direct database imports do not invalidate Next's cache.

The importer reads PostgreSQL plain-text `COPY` blocks as data. It does not run
the dump or restore Strapi tables. An explicit allowlist excludes accounts,
passwords, tokens, submissions, permissions and backend configuration. Keep the
source export and generated content private; `.private/` is ignored.

## Commands

Run from `remake/`, with the replacement database configured in `.env.local`:

```sh
npm run content:import -- --dump ../db-backup/dump.sql --dry-run
npm run content:import -- --dump ../db-backup/dump.sql --apply
node --import tsx scripts/migration/audit-media.ts --dump ../db-backup/dump.sql
node --import tsx scripts/migration/audit-media.ts --dump ../db-backup/dump.sql --verify-failures
```

The default is a dry run. Standard output contains aggregate counts, source IDs
and anomaly codes. `--export-private` also writes a complete private migration
bundle to `.private/migration-content.json`, with mode `0600`; never commit or
serve that file. The migration report and media availability report use the same
private directory. The import service handles repeat imports and target-side
editing conflicts; do not resolve a conflict by deleting editorial changes.

## Audited source mapping, 31 October 2026

| Source               | Imported | Published | Draft |
| -------------------- | -------: | --------: | ----: |
| Magazine articles    |      146 |       146 |     0 |
| News posts           |       92 |         6 |    86 |
| Notices              |       10 |         1 |     9 |
| Events               |        3 |         1 |     2 |
| Historical bulletins |      162 |       158 |     4 |
| Parish settings      |        1 |         1 |     0 |
| Static source pages  |       30 |        29 |     1 |

Article publication deliberately overrides the source status; 32 articles were
originally published. Original publication/creation/update timestamps and a
source hash remain in provenance. Display dates use the source publication date,
or creation date when publication is absent, interpreted in Bratislava.

The 24 admin-page records and six community-page records retain ordered sections,
rich text, images, captions and safe external link fallbacks. Twenty-nine map to
known routes; the unmapped admin-page source ID 36 is unpublished and remains
private. The public application reads only published source pages into its
purpose-designed layouts. No public historical-bulletin archive is added.

The private media inventory retains **1,081 Cloudinary originals**: 1,075 images
and six other attachments. It preserves provider public IDs, original URLs,
dimensions, captions and 652 relationships. The 518 currently unreferenced
assets remain available privately for recovery. This inventory does not make
unpublished attachments public or add document-upload/parsing features.

## Reconciled alternate bodies and presentation

- Article source ID 2 has an empty flat body; its ordered section supplies the
  text. ID 5 has equivalent flat/section text, which is included once.
- IDs 3 and 4 have equivalent text with minor formatting differences. Each flat
  body also contains one image absent from its section body. The section text
  and its formatting are retained, followed by that additional image. Duplicate
  text is suppressed; media dimensions/captions use the original inventory.
- Canonical bodies use validated Tiptap JSON. Markdown headings, emphasis,
  underline, links, lists, quotations, images and galleries survive conversion.
  Source HTML is never executed. External iframe content becomes a descriptive
  link, allowing the custom page to choose an appropriate integration later.
- Descriptions become plain-text leads, bounded to approximately 300 characters
  when the source contains a whole article. Short authored leads remain intact;
  a missing description falls back to the body. All 146 magazine summaries are
  between 25 and 300 characters after conversion, with no Markdown markers.
  Comparing canonical body hashes before and after this projection found no
  changes to full editorial bodies.
- Published news source IDs 165, 166, 163 and 131 are the explicit initial poster
  placements. Other news retains its detail content. Events retain their poster
  and destination when present. The special `den-farskej-rodiny` destination
  remains `/den-farskej-rodiny`, including for its currently private post.
- Three slugs overlap across article/news families; uniqueness is enforced
  within each route family. Incomplete news drafts 151 and 155 retain their
  private content and require a title/slug before publication.

## Historical anomalies

Problematic imported bulletins are read-only. Valid historical, current and
future weeks remain editable; date-based eligibility prevents a historical edit
from making an old week current. Source dates and publication states are
preserved; anomalous records are excluded from current public scheduling.

| Source IDs         | Finding                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| 199                | Five source Mass entries have no valid time; legacy prototype retained. |
| 271, 272, 273, 274 | Thursday dates do not match their owning week.                          |
| 289                | Unpublished alternative has inconsistent Tuesday–Sunday dates.          |
| 330                | Sunday date does not match its owning week.                             |
| 340, 341           | Two published records own the same week. Both are quarantined.          |

Private alternatives for otherwise valid published weeks do not disqualify the
valid public record. Historical source weeks span 30 October 2023 to 26 October 2026. No historical dates or Mass intentions are silently rewritten.

Donation children retain their source categories (funerals, weddings, baptism,
charity, urn burials and other) with the original Slovak display labels and order
within each category. The 126 empty structural donation containers are omitted;
all six actual categorized entries remain. A parent row with a real name or
amount would be preserved, including an amount-only row with a blank name. No
donor identity or amount is invented. All 153 valid editable source bulletins
pass the new publication validator after this projection; the nine problematic
records remain read-only.

Published contact details, office hours, preparation meetings and priest contacts
come from the source. The source has no authoritative recurring-times collection.
The imported recurring template therefore starts empty and carries
`regular-schedule-unconfirmed`; enter/confirm it with the parish before launch.

## Verification and release limits

Ten synthetic migration tests exercise COPY escaping/truncation, private-table exclusion,
publication policy, incomplete drafts, alternate text/image reconstruction,
ordered galleries/captions, safe rich text, bounded plain leads without body loss,
repeatable hashes, and anomalous
historical weeks, categorized donation fidelity, media audit host restrictions
and snapshot matching. Private parsing of the actual export reconciles all counts,
finds no missing referenced components and validates all 281 editorial/static
canonical bodies. All published non-bulletin documents also pass publication
validation. Historical anomalies are intentionally retained outside the new
publication validator.

The availability audit uses bounded, read-only `HEAD` requests against existing
Cloudinary URLs, refuses other hosts, and records failed source IDs without
printing source URLs. A successful `HEAD` proves present availability; it does
not establish ownership, licensing, or a recoverable original backup.

The 31 October audit found 1,000 originals available, 76 returning HTTP 404 and
five returning HTTP 401. Bounded `GET` requests, with response bodies discarded,
confirmed all 81 failures. The five restricted assets are unreferenced PDFs;
their restrictions are preserved. Missing images affect newly published article
source IDs 69, 74, 75, 76, 77, 78, 80, 89, 91, 92 and 94. No formerly public
editorial record or published static source page uses the failed assets.
Sixty failed assets have source relationships; 21 are unreferenced. Searching
the local design archive and Gatsby caches/output by original filename, public
ID and normalized hash found no matching recovery copy. Preserve the source
URLs, show a suitable missing-image state, and recover originals with the owner
before declaring media recovery complete. Do not substitute unrelated images or
bypass restricted delivery.

Two read-only Cloudinary Admin API requests then checked all 76 missing public
IDs and searched deleted image assets: no active matching assets and no deleted
backup records were returned. No asset was restored, uploaded or made public.
A private 76-row recovery-request CSV is prepared under `.private/` and has not
been sent. Cloudinary documents support-assisted recovery as a case-by-case
option when automatic backups are absent; it is not a verified recovery path for
this account. See the [official backup and version-management documentation](https://cloudinary.com/documentation/backups_and_version_management).

Before cutover, obtain a fresh private source export and compare hashes during an
editing freeze. Verify parish settings, the recurring template, asset recovery,
replacement-database backup/restore and deployment access. This source mapping
does not establish that the local dump is the final authoritative snapshot.
