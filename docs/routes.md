# Public route and content map

[Remake setup](../README.md) · [Project plan](remake/plan.md) ·
[Migration report](migration.md)

Legacy paths remain mapped or redirected, including `/404/`. Informational pages
use distinct React layouts and full published source reading copy. Editorial
content, settings and schedules use the replacement database. Completing this
implementation does not establish parish approval of current information or
establish live Google login or full operational readiness.

## Fixed routes

| Public path                                 | Implemented presentation/content                                                                                            | Parish or release review                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/`                                         | Published schedule, active noticeboard, St Charbel, hospital, parish services, altar, feedback and donations                | Confirm current schedule, placements and shared settings                                     |
| `/farnost/farske-oznamy`                    | Sunday–Sunday view, announcements and date-based eligibility                                                                | Confirm recurring template; historical anomalies remain quarantined                          |
| `/farnost/nase-spolocenstvo`                | Magazine articles; twelve summaries initially and twelve per click                                                          | Review newly published material and missing-image recovery                                   |
| `/farnost/galeria`                          | 308 redirect to `/farnost/kostol-sv-alzbety#galeria`                                                                        | Confirm individual rights and recoverable original backups                                   |
| `/farnost/kostol-sv-alzbety`                | Curated church page, galleries, history photographs and safe 3D resources                                                   | Review historical copy/attribution                                                           |
| `/farnost/kostol-sv-jana-pavla-v-lieskovci` | Full history, four-photo collection, chronology aside and author credit                                                     | Review historical copy/attribution                                                           |
| `/farnost/kostol-sv-matusa-v-zolnej`        | Full history, paintings/conservation copy, eight-photo collection, chronology and credits                                   | Review history; old third-party tour is withheld                                             |
| `/farnost/cirkevna-skola`                   | Full illustrated school introduction, educational layout and official school link                                           | Outdated statistical figures removed in the approved refresh; confirm current school details |
| `/farnost/kalendar-akcii`                   | Preserved hidden route with current notice/poster destinations                                                              | No additional calendar backend is implied                                                    |
| `/farnost/virtualna-prehliadka`             | 308 redirect to `/farnost/kostol-sv-alzbety#virtualna-prehliadka`                                                           | Confirm third-party resources before embedding                                               |
| `/sviatosti/sviatost-krstu`                 | Full preparation, documents, godparent and adult guidance; shared office/Náuky card; original PDF                           | Confirm current pastoral instructions and arrangements                                       |
| `/sviatosti/sviatost-eucharistie`           | Full children/adult preparation, sick visits and catechism quotation                                                        | Parish review                                                                                |
| `/sviatosti/sviatost-birmovania`            | Guidance and quotation; expired 2021–22 preparation replaced by current contact guidance                                    | Confirm new preparation cycle                                                                |
| `/sviatosti/sviatost-manzelstva`            | Preparation, documents and guidance; shared Náuky card; expired course list removed                                         | Confirm next courses and detailed requirements                                               |
| `/sviatosti/sviatost-zmierenia`             | Full confession guidance, quotation and notices link                                                                        | Confirm current extended confession arrangements                                             |
| `/sviatosti/sviatost-pomazania-chorych`     | Full source pastoral guidance and contact card                                                                              | Parish review                                                                                |
| `/spolocenstva/detsky-spevokol`             | Full Alžbetka introduction and four-photo collection                                                                        | Confirm rehearsal times and leader contact                                                   |
| `/spolocenstva/mladeznicky-zbor`            | Full Alžbeta introduction and four-photo collection                                                                         | Confirm rehearsal times and leader contact                                                   |
| `/spolocenstva/ministranti`                 | Full service/community introduction and eight-photo collection                                                              | Confirm current meetings and leader contact                                                  |
| `/spolocenstva/reholne-sestry`              | Full congregation/history copy and four-photo collection                                                                    | Confirm current community details                                                            |
| `/spolocenstva/akolyti`                     | Curated service description and parish contact                                                                              | Confirm current service arrangements                                                         |
| `/spolocenstva/lektori`                     | Curated service description and parish contact                                                                              | Confirm current service arrangements                                                         |
| `/spolocenstva/ruzencove-bratstvo`          | Neutral preparing-content state and office contact                                                                          | Legacy page requested an editor; dedicated parish text still needed                          |
| `/birmovanci`                               | 308 redirect to `/sviatosti/sviatost-birmovania`                                                                            | Confirm current preparation requirements                                                     |
| `/kontakt`                                  | Published contacts, mobile, address/IČO, office note/hours, Náuky, all priest cards, map, dynamic QR/IBAN and partner links | Confirm shared settings and contact ownership                                                |
| `/objav-krista`                             | Original public Form link and office fallback                                                                               | No matching SQL page exists; public archive link retained; confirm active campaign           |
| `/den-farskej-rodiny`                       | Preserved event history; expired registration removed and current contact guidance added                                    | Confirm new event/year before promoting registration                                         |
| `/404/`                                     | Shared not-found design; unknown paths return a genuine 404                                                                 | Verify deployed status/indexing                                                              |

Additional current routes include `/farnost/o-farnosti` (parish history),
`/farnost/duchovna-sluzba-v-nemocnici`, `/farnost/obnova-oltarov` and `/podnety` (visitor feedback).

`/farnost`, `/sviatosti` and `/spolocenstva` are menu groups. Unknown children do
not become generic informational pages. `/prispevky` redirects permanently to `/#vyveska`.

## Source-controlled informational content

[information-content.ts](../src/content/information-content.ts) contains only the
29 published source pages, with ordered reading sections, captions and media.
It imports `server-only`; other pages' reading copy is not shipped as a client
JavaScript bundle. Source page 36 and all private/auth records are excluded. The
22 purpose-specific definitions in [information.ts](../src/content/information.ts)
select the sacrament, church, community, school, contact, gallery or resource
layout. Homepage/listing/bulletin/404 source records do not override their own
dedicated application routes.

Check the raw export against an authorized private dump. For regeneration and
review, follow the contributor README:

```sh
npm run content:generate:check -- --dump db-backup/dump.sql
```

Rich text is used inside reading areas; the legacy dynamic-zone page builder is
not recreated. Old decorative hero/navigation sections map to the new hero and
related-page cards. Full reading text and collections replace the abridged design
samples. Source quotations and author/photographer credits remain visible.
Acolytes and lectors now have curated service copy; the rosary community retains
a neutral preparing-content state. Reviewed expired-guidance and choir corrections
live in `information-updates.ts`; the original 29-record export stays unchanged.
See the [approved refresh](remake/content-refresh-2026-10-31.md), dated plan and
[static content fidelity review](static-content-review.md). Legacy `page.content`
values were SEO metadata, not visible reading copy; editor notes are excluded.

Office facts come from `getPublicSettings`: phone, email, address, hours, Náuky,
notes, priests and donation details. The original baptism meeting-time
clause remains unchanged; it is not generalized from shared settings. A settings outage shows an
unavailable state without fixture contacts. Informational routes render at
request time so successful publication of settings updates their shared facts.
Static reading-copy changes require a reviewed code change, as planned.

## Editorial paths and schedule history

| Family                              | Content policy                                               |
| ----------------------------------- | ------------------------------------------------------------ |
| `/farnost/nase-spolocenstvo/[slug]` | All 146 imported magazine articles are public                |
| `/prispevky/[slug]`                 | Published news/events only; unpublished records stay private |
| `/vyveska/[slug]`                   | Published text notices and preserved detail destinations     |

Slugs are scoped to their route family. Article/news slug overlaps never merge
records. The special `/den-farskej-rodiny` destination remains intact. Historical
bulletins have no public archive route. Nine problematic source bulletins are
read-only; valid weeks remain editable and calendar eligibility controls what is
current.

## Redirects and external resources

All four legacy `static/_redirects` mappings remain:

| Original                                | Destination              |
| --------------------------------------- | ------------------------ |
| `/cms/index.php/farnost/farske-oznamy/` | `/farnost/farske-oznamy` |
| `/cms/index.php/`                       | `/`                      |
| `/cms/`                                 | `/`                      |
| `/cms/index.php/farnost/kontakt`        | `/kontakt`               |

Next.js uses permanent 308 redirects and normalizes trailing slashes. Unknown
paths return 404. Existing Forms, the baptism PDF, maps and Sketchfab models use
explicit external links. The site includes a private visitor-feedback form and Vercel Analytics. The
admin supports Word/text bulletin import, not PDF parsing. No separate calendar
backend or automatic legacy-tour iframe is introduced.

On 31 October 2026, bounded read-only requests checked 19 provider URLs. Google
Forms, the baptism PDF, Google Maps and both Sketchfab models returned HTTP 200
landing pages. This proves current readability, not an event's active dates,
form acceptance, ownership or perpetual availability. No form was submitted.

The Wonderful360World domain returned HTTP 200, but the specific legacy Zolná
tour path returned an unrelated gambling-page title. Other paths mostly had
blank titles; the domain homepage retained a tour title. This evidence does not
establish the state of the entire domain. All legacy tour URLs are withheld from
public pages pending owner verification, with a photo/3D fallback. Their original
URLs remain in the private migration registry. The audit never executed external
HTML. Detailed evidence is ignored in `.private/link-audit.json`.

## Gallery behavior and rights

Each collection retains its source image order. The main gallery credits Claudia
Nemcová by collection and ArtSohl / Pavol Albert for the third collection. Church
histories retain Jozef Kaniansky credits. Source captions remain in the viewer.
Photography rights remain distinct from the repository's code licence.

The main church gallery renders sixteen thumbnails at a time; shared collection
views default to twelve, with explicit overrides for individual presentations;
images load lazily. The native modal opens only the selected enlarged image and
supports Escape, arrows, focus containment and focus return. Thumbnails may crop
for browsing; the viewer preserves the full image. Delivery checks found no
missing images in the published static source collections; separate newly
published article assets still require recovery, as recorded in the migration
report. Current delivery is not a recoverable original backup.

## Local verification record

The following is historical evidence from 31 October 2026; later route moves and
pagination supersede its exact counts. Current verification is in the
[dated plan](remake/plan.md#verification-record).

The then-current local production preview was checked against the replacement database
with a read-only transaction. All 146 article, six news, one notice and one event
detail paths returned HTTP 200 with one H1. All 28 positive fixed/listing paths
returned 200; four legacy redirects and six unknown/history path checks passed.
Article pagination returned exactly 146 distinct summaries in 24 requests, with
ten initially, at most six subsequently, and no body/draft/provenance fields.

All 84 private news records with slugs returned 404, as did nine private notices
and two private events. Two additional private news records have no public slug.
Their administrative endpoints returned only the generic fail-closed
`AUTH_NOT_CONFIGURED` response; no record fields were returned. This local
environment still requires real Google OAuth configuration. It does not count
as verification of a real Google sign-in or configured-session authorization.

Repeat the local route check from the repository root:

```sh
node --conditions=react-server --import tsx scripts/verify-imported-public.ts --base-url http://127.0.0.1:3101
```

The command refuses non-local database/preview hosts and logs counts, not private
slugs or body text. Its detailed report is ignored under `.private/`.

Focused browser checks covered seven content routes at 320, 390 and 1440 pixels:
one H1, correct page Open Graph title, noindex in the local preview, no horizontal
overflow, no iframe loads or runtime errors. That earlier pass checked collapsed course sections and a shared baptism clause;
the later [fidelity review](static-content-review.md) supersedes those presentation
choices and restores unchanged, directly visible source text. Gallery
checks expanded all 120 photographs, verified collection credits, first-new-item
focus, end states, arrow navigation, Tab containment, Escape and focus return.
After explicit scrolling, all 120 gallery thumbnails and all 11 contact-page
images decoded successfully, with no pending/failed images or missing-image
placeholders.
