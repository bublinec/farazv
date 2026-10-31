# Static content refresh · 31 October 2026

The user requested another detail/layout pass and explicitly allowed outdated
meeting, course and deadline content to be updated. This supersedes the earlier
strict preservation requirement for these reviewed current-facing items. Church
history, sacramental teaching, quotations and credits remain preserved.

## Reviewed changes

| Page                                                             | Removed or updated                                                                                                        | Current treatment                                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [Confirmation](https://farazv.sk/sviatosti/sviatost-birmovania/) | Announcement for 16 October 2022, preparation starting October 2021, its fortnightly timetable and pandemic qualification | Keep the sacramental guidance; direct readers to current parish notices or the office for the present preparation dates |
| [Marriage](https://farazv.sk/sviatosti/sviatost-manzelstva/)     | March, May and August 2026 course headings/timetables, all completed by the review date                                   | General preparation heading and office/current-notice guidance; document requirements and teaching remain               |
| [Parish family day](https://farazv.sk/den-farskej-rodiny/)       | Poster for 13 June 2026, alternative 20 June, and its registration form                                                   | Direct readers to current announcements and the office for the next event/registration                                  |
| [School](https://farazv.sk/farnost/cirkevna-skola/)              | Welcome for 2022/23 first-years and the unverified “currently 234 pupils” claim; relative “the year before last” wording  | Retain the foundation and achievements; remove the stale count/welcome and use historical wording for the award         |

The poster dates were checked visually in the actual published image. The old
confirmation/marriage pages still carry dated operational text; they are evidence
of the old copy, not confirmation of replacement dates. No reliable new course
or confirmation dates were found. The remake does not invent a 2027 timetable.

## Content kept

Historical years are not automatically stale. Consecrations, restoration history,
the sisters' relocation, school foundation and author/photographer credits stay.
The original recurring baptism/choir/servers times also stay: no evidence was
found that these particular recurring arrangements expired. General annual
October preparation is not treated as a dated 2021/22 announcement. Parish
confirmation of ongoing arrangements remains part of release review.

The magazine articles and historical editorial records are unchanged.

## Ownership and safeguards

`src/content/information-content.ts` remains the deterministic raw public export
of all 29 published source records. `src/content/information-updates.ts` applies
four explicit, reviewed reading projections. Source section IDs and expected text
or poster URL guard each correction; new source content requires another review
rather than silently losing a newly supplied timetable. No old SQL export,
provenance record or shared Cloudinary original was deleted.

The expired family-day form was removed from its current layout definition in
`information.ts`. The independent approved fixture was deliberately updated only
for the four reading projections and that resource link. Its 29 original source
records remain byte-for-byte structurally unchanged. Current reading has
**224 blocks: 219 unchanged blocks and five refreshed blocks** across 24 layouts.
The initial 230-block source inventory remains documented as migration history.

Both live design variants use the refreshed public copy. Their preserved earlier
screenshots remain dated records and are not overwritten. The exporter continues
to reproduce raw source; after a fresh export, review/retire corresponding
corrections and update the independent approval record deliberately.

## Detail/layout pass

- Noticeboard and latest news precede the church welcome/photos on v2; compact
  shortcuts expose the main homepage sections.
- Today and selected-day status are distinct. Mobile day buttons remain in
  Sunday–Sunday order and use a 4×2 arrangement with touch targets of at least 44 px.
- Sacrament pages put contact/form actions before long copy. Longer reading has
  topic navigation; history uses the right column on desktop and puts topics
  before reading on mobile.
- Chapter spacing, serif subsection headings, reading width and mobile paragraph
  size were refined. Topic targets receive keyboard focus; decorative shortcut
  arrows are hidden from accessible names.

Verification and the new screenshots are recorded in
[the refined design record](design-history/v2-refined/README.md). No hosted
content, database, Google configuration, uploads or deployment was changed.
