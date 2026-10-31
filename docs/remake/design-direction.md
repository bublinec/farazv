# Design direction · our parish, our church

Recorded 31 October 2026 after the user requested a warmer, more familiar second
design. This is a comparison study, not a decision to replace the current default.

## What the user wants to preserve

The site should feel like **our parish and our much-loved church**: recognisable,
lived in and specific to Zvolen. Clear navigation and readable pages still matter.
A flawlessly neutral collection of cards, thin rules and empty white space is not
sufficient. Real church photographs can belong in small accents as well as the
main hero and gallery. Evergreen and historical reading content stays preserved. A later user-authorized
[expiry refresh](content-refresh-2026-10-31.md) removes specific completed
announcements from current guidance.

## What the comparison revealed

The old frontend used actual pew/carpet photographs in section backgrounds and
its own illustrated church tower in navigation. Those familiar details helped
visitors recognise their place. The first remake retained the main photograph
and gallery, but concentrated photography into isolated sections; its repeating
heading/rule/card rhythm made everything else feel more generic.

The second proposal restores photographic continuity: visible warm wood, red
carpet, painted vaults, the window and liturgical book. Small crops and uneven
photo proportions create character through the building itself. No stock church,
invented ornament or generated photograph is needed.

## Typography judgment

Ubuntu is not a wrong font. It is friendly, familiar and useful for menus,
schedules, labels and forms. Using it for every headline and long passage gives
the whole site a more contemporary, utilitarian texture than the church imagery.
Changing the font alone would not restore the missing parish character.

The implemented experiment pairs **Source Serif 4** for public headings and
reading passages with **Ubuntu** for practical interface text and admin. Source
Serif has a restrained book-like character that leaves room for the existing art.
Its normal/italic variable files are self-hosted; Slovak letters and quotation
marks were checked in both binaries. Provenance, license and exact file details
are in [the font record](../../remake/public/fonts/README.md), with
[Adobe's specimen](https://adobe-fonts.github.io/source-serif/) and
[pinned release](https://github.com/adobe-fonts/source-serif/releases/tag/4.005R).
Lora would be a more calligraphic alternative, but richer letterforms would
compete more with the already ornate photographs. That is a design judgment,
not a claim that either font is inherently more appropriate for a parish.

## Implemented comparison

| Area            | Version 1 · preserved                              | Version 2 · parish study                                                                                         |
| --------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Identity        | Blue/gold and Ubuntu, general church icon          | Familiar blue/gold, warmer ivory, original illustrated tower, serif parish name                                  |
| Mass hero       | Dark photograph under the schedule                 | Readable cream schedule beside a visible, unmasked church photograph; photo band on mobile                       |
| Church presence | Main hero and one gallery section                  | Small pew/vault/window group, liturgical-book inset, magazine photo detail, page-heading window and footer vault |
| Reading         | Ubuntu                                             | Source Serif headings/reading areas; practical controls stay Ubuntu                                              |
| Rhythm          | Repeated section-heading and bordered-card pattern | Some asymmetry, different photo proportions and lighter community rows                                           |
| Content/data    | Same existing sources                              | Same sources, article pagination and date rules; static content unchanged                                        |

The Masses and parish notices remain easy to reach. This is a working parish
website rather than an art catalogue: extra imagery should not push basic tasks
out of reach. Contrast, touch targets, focus, mobile width and source credits
remain requirements. Avoid artificial wear, decorative fonts everywhere, tiny
script text, random patterns and making every panel a photographic banner.

## Compare and maintain

On a local/nonproduction instance:

- `/design` explains the two directions.
- `/design/v1` selects the current original design.
- `/design/v2` selects the parish study across the normal public routes.

The selected presentation is stored in one seven-day, first-party preference
cookie. The top review bar can return to v1 on the same public page. A relative
redirect preserves the browser's host, including local/proxy setups. Selection
is disabled on Vercel production, and admin always keeps its current interface.
The default with no preference remains v1. There are no duplicated content stores
or public-route forks.

The preserved [v1 source, hashes and screenshots](design-history/v1/README.md)
are the recovery record. The [v2 screenshots](design-history/v2/README.md) show
the experiment. Current owners:

- `src/content/design.ts`, `server/public-design.ts`, `app/design/`: selection.
- `components/design/ParishTheme.module.css`: scoped palette/type/reading style.
- `components/design/ChurchWelcome.tsx`, `content/church-details.ts`: real accents.
- `components/home/MassHero.*`, `app/page.*`: optional homepage composition.
- `components/layout/Header.*`, `Footer.*`: optional parish masthead and footer.

Church-gallery photographs retain Claudia Nemcová's existing attribution and
portfolio link. The copied tower illustration is the original legacy asset
`src/assets/other/churchWatermark.png`; its authorship is not newly inferred.
Using existing assets does not change their rights. Keep the visible credits.

## Review before choosing a default

Compare the homepage, baptism and church history on desktop and a real phone.
The useful questions are whether parishioners recognise their church immediately,
whether the typography feels welcoming rather than formal, and whether today's
Masses/notices are still easy to find. Review with both frequent visitors and
people arriving for a sacrament. Human preference and parish acceptance remain
separate from automated accessibility and content checks.

The proposal is implemented locally for review; the hosted preview is unchanged.
The later [detail pass](design-history/v2-refined/README.md) improves task ordering,
reading navigation, touch targets and selected dated content.
Verification details and screenshots are recorded with [v2](design-history/v2/README.md).
