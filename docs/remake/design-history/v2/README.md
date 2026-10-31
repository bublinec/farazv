# Design v2 · our parish study

Captured on 31 October 2026. This opt-in design study gives the church photographs
more room, brings back the familiar church illustration, and pairs Source Serif 4
headings and reading copy with practical Ubuntu navigation and controls. The
[preserved v1 design](../v1/README.md) remains available for comparison.

| Page                            | Desktop · 1440 px           | Mobile · 390 px            |
| ------------------------------- | --------------------------- | -------------------------- |
| Homepage                        | [View](home-desktop.jpg)    | [View](home-mobile.jpg)    |
| St Elizabeth church and history | [View](history-desktop.jpg) | [View](history-mobile.jpg) |
| Baptism                         | [View](baptism-desktop.jpg) | [View](baptism-mobile.jpg) |

[Capture metadata](captures.json) records routes, image hashes, viewports, resolved
heading fonts and browser checks. All six pages returned HTTP 200 with the correct
heading and parish variant, loaded their images, and had no horizontal overflow
or browser runtime/hydration errors.

The source remains an opt-in variant in the application. On a local or preview
deployment, navigate to `/design/v2` to select it, `/design/v1` to return to the
original, or `/design` for the comparison page. The selection changes presentation
only. Production deployments do not enable these review selectors.

## Reproduce the captures

Start an explicitly owned local server with `CONTENT_SOURCE=fixtures`,
`PREVIEW_DATE=2026-10-31` and indexing disabled. With the remake dependencies
installed, run from the repository root:

```sh
node docs/remake/design-history/v2/capture.mjs http://127.0.0.1:3103
```

The script selects v2 by hard navigation and checks the expected page headings.
It writes these reference images and metadata, plus ignored first-viewport PNGs
under `remake/.private/`. It uses Slovak locale, Bratislava time, reduced motion
and one device pixel per CSS pixel. Cloudinary photographs remain remote assets.
Keep these captures aligned with the reviewed v2 source; preserve another version
before recording a different design direction.

## Verification scope

The integrated fast check passed formatting, Next route types, TypeScript and
71 unit/security tests (one opt-in database suite skipped). Production build
passed. All 13 existing public browser flows passed in the parish variant, and
the final original-design run plus three selector/isolation cases passed 16/16.
Those cases cover the return to v1 on the same path, safe relative redirects,
320/390/768/1440 px widths and admin remaining outside the theme.

The parish accessibility/static run passed 13 cases: 11 axe checks and two
content/gallery cases. One historical-missing-image accessibility case was
intentionally skipped without its optional migrated-data path. The independent
static baseline still protects all 29 published records, 24 layouts and 230
reading blocks. Actual Source Serif loading, Ubuntu navigation and page-heading
photo legibility were also checked at desktop/mobile sizes. Manual parish and
screen-reader acceptance remain separate.
