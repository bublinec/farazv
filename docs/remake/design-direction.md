# Design direction · our parish, our church

Recorded 31 October 2026 after the user requested a warmer, more familiar second
design. The user accepts v2 overall with the original v1 homepage hero retained.
The latest refinement also restores the original page photographs, stained-glass
sacrament section and catechism quote bands shown in the user's screenshots.
This selects the composition; changing the production default remains a release step.

## What the user wants to preserve

The site should feel like **our parish and our much-loved church**: recognisable,
lived in and specific to Zvolen. Clear navigation and readable pages still matter.
A flawlessly neutral collection of cards, thin rules and empty white space is not
sufficient. Real church photographs can belong in small accents as well as the
main hero and gallery. Evergreen and historical reading content stays preserved. A later user-authorized
[expiry refresh](content-refresh-2026-10-31.md) removes specific completed
announcements from current guidance.

## What the comparison revealed

The old frontend used page-specific photographs of church details, a dark
stained-glass sacrament section, pew/carpet section backgrounds and its own
illustrated tower in navigation. Those familiar details helped visitors recognise
their place. The first remake retained the main photograph and gallery, but
concentrated photography into isolated sections; its repeating heading/rule/card
rhythm made everything else feel more generic.

The second proposal restores photographic continuity: visible warm wood, red
carpet, painted vaults, the window and liturgical book. Small crops and uneven
photo proportions create character through the building itself. The latest pass
also restores the saved original cover crops across public page headers. Five
legacy stock/illustration covers receive genuine church-gallery details, with
supplementary real photographs for the news list and curated discovery page.
These choices live outside the unchanged source export. No invented ornament or
generated photograph is needed.

## Typography judgment

Ubuntu is not a wrong font. It is friendly, familiar and useful for menus,
schedules, labels and forms. Using it for every headline and long passage gives
the whole site a more contemporary, utilitarian texture than the church imagery.
Changing the font alone would not restore the missing parish character.

The current v2 composition pairs **Source Serif 4** for public headings and
reading passages with **Ubuntu** for practical interface text, the original
homepage hero and admin. Source Serif has a restrained book-like character that
leaves room for the existing art.
Its normal/italic variable files are self-hosted; Slovak letters and quotation
marks were checked in both binaries. Provenance, license and exact file details
are in [the font record](../../public/fonts/README.md), with
[Adobe's specimen](https://adobe-fonts.github.io/source-serif/) and
[pinned release](https://github.com/adobe-fonts/source-serif/releases/tag/4.005R).
Lora would be a more calligraphic alternative, but richer letterforms would
compete more with the already ornate photographs. That is a design judgment,
not a claim that either font is inherently more appropriate for a parish.

## Current composition

| Area             | Version 1 · preserved                              | Version 2 · chosen composition                                                                               |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Identity         | Blue/gold and Ubuntu, general church icon          | Familiar blue/gold, warmer ivory, original illustrated tower, serif parish name                              |
| Mass hero        | Dark photograph under the centered schedule        | Same original full-width photograph, dark overlay, centered schedule/cards and Ubuntu title                  |
| Church presence  | Main hero and one gallery section                  | Original page-cover photographs, dark stained-glass sacrament section, small church details and footer vault |
| Reading          | Ubuntu                                             | Source Serif headings/reading areas; practical controls stay Ubuntu                                          |
| Sacrament quotes | Inline source quotations                           | Complete source quotations and attributions in full-width pale-blue bands immediately below their heroes     |
| Rhythm           | Repeated section-heading and bordered-card pattern | Some asymmetry, different photo proportions and lighter community rows                                       |
| Content/data     | Shared sources and reviewed public corrections     | Same sources, article pagination, date rules and reviewed public corrections                                 |

The initial v2 study used a cream schedule beside a separate photograph, with a
photo band on mobile. The user subsequently chose the original v1 hero for the
otherwise warmer v2 design. Both variants now share that hero, including the
current semantic date/today markers and minimum 44 px day controls. Small screens
keep eight ordered days in two rows of four. Earlier split-hero screenshots remain
historical records; this preference does not remove the church accents elsewhere.

The restored homepage sacrament section uses the original public `window.png`
background, an 80% dark overlay, six unchanged descriptions and gold links. Its
three-column desktop layout becomes two columns and then one on smaller screens.
Each sacrament page places its existing full catechism quotation and attribution
in a pale-blue band below its own photograph. The quote is rendered exactly once;
reading copy, section destinations and source order stay intact. All 29 source
records, 24 layouts and 224 current approved reading blocks remain unchanged.

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
are the recovery record. The [first v2 screenshots](design-history/v2/README.md)
and [detail-pass captures](design-history/v2-refined/README.md) show the earlier
split-hero experiment; they remain immutable. Current owners:

- `src/content/design.ts`, `server/public-design.ts`, `app/design/`: selection.
- `components/design/ParishTheme.module.css`: scoped palette/type/reading style.
- `components/design/ChurchWelcome.tsx`, `content/church-details.ts`: real accents.
- `content/page-photographs.ts`, `components/ui/PageHero.*`: page-specific covers
  and their scoped photographic headers.
- `content/sacraments.ts`, `components/home/SacramentsSection.*`: original banner,
  six summaries and responsive presentation.
- `components/information/SourceQuotation.*`, `SacramentPage.tsx`,
  `PublishedContent.tsx`: original quotation band and single rendering of its copy.
- `components/home/MassHero.*`: shared original photographic schedule hero.
- `app/page.*`: optional parish homepage composition around the shared hero.
- `components/layout/Header.*`, `Footer.*`: optional parish masthead and footer.

Church-gallery photographs retain Claudia Nemcová's existing attribution and
portfolio link. The copied tower illustration is the original legacy asset
`src/assets/other/churchWatermark.png`; its authorship is not newly inferred.
The original precomposed `window.png` sacrament banner has no recorded
photographer; the gallery attribution is not applied to it.
Using existing assets does not change their rights. Keep the visible credits.

## Review before promoting the default

Compare the homepage, baptism and church history on desktop and a real phone.
The useful questions are whether parishioners recognise their church immediately,
whether the typography feels welcoming rather than formal, and whether today's
Masses/notices are still easy to find. Review with both frequent visitors and
people arriving for a sacrament. Human preference and parish acceptance remain
separate from automated accessibility and content checks.

The chosen composition is implemented locally for review; the hosted preview is
unchanged.
The later [detail pass](design-history/v2-refined/README.md) improves task ordering,
reading navigation, touch targets and selected dated content.
Its screenshots predate the original-hero preference recorded in
[D30](decisions.md#d30--keep-v2-with-the-original-homepage-hero-31-october-2026).
The [current homepage captures and checks](design-history/v2-original-hero/README.md)
show v2 with that shared original hero before the latest photographic and
sacrament-section restoration in
[D31](decisions.md#d31--restore-page-photographs-and-sacrament-bands-31-october-2026).
Verification of that latest refinement is recorded in [the progress log](plan.md).
