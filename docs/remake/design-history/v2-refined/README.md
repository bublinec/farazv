# Version 2 · detail refinement

Local review recorded on 31 October 2026, following the request to improve clarity
and remove expired meeting/deadline notices. This refines the parish design study;
the preserved [first v2 captures](../v2/README.md) and [v1 reference](../v1/README.md)
remain unchanged. Hosting and the default design are unchanged.

Sacrament pages now place contact and existing forms before long reading. Longer
pages have topic links; church history uses the desktop sidebar for these links
and places them before the text on mobile. Reading uses consistent serif headings,
a narrower measure and clear spacing between topics. Historical text, photographs
and credits remain available. Editorial changes are recorded in the
[dated content refresh](../../content-refresh-2026-10-31.md).

| Page           | Desktop · 1440 px              | Mobile · 390 px                |
| -------------- | ------------------------------ | ------------------------------ |
| Homepage       | [Capture](home-desktop.jpg)    | [Capture](home-mobile.jpg)     |
| Church history | [Capture](history-desktop.jpg) | [Capture](history-mobile.jpg)  |
| Baptism        | [Capture](baptism-desktop.jpg) | [Capture](baptism-mobile.jpg)  |
| Marriage       | —                              | [Capture](marriage-mobile.jpg) |

The captures use explicit fixture content dated 31 October 2026. They show layout,
not a new confirmation of parish schedules or contact details. Image hashes,
viewport dimensions, text measurements, topic destinations and focus-jump results
are in [captures.json](captures.json). Homepage image checks and hashes are
recorded separately in [home-captures.json](home-captures.json).

The v2 accessibility suite passed 11 cases; its optional unavailable historical
image case was skipped because that migrated article was not selected. Additional
checks on history at both widths and marriage on mobile found no automated WCAG
A/AA violations. Browser review checked topic destinations, keyboard focus,
reading width, image loading and horizontal overflow. Automated checks complement
human visual and screen-reader review.

To reproduce the five information-page captures against an explicitly owned
local server:

```sh
node docs/remake/design-history/v2-refined/capture.mjs http://127.0.0.1:3103
```

The script rejects port 3100, selects `/design/v2`, and writes only this capture
directory and ignored local inspection images under `remake/.private/`.
An optional capture name, such as `marriage-mobile`, refreshes only that view and
its measurements while preserving the other images and records.

## Final integrated checks

Production build, TypeScript and formatting passed. Unit/security checks passed
75 tests, with one opt-in database suite skipped. Public/design/static browser
checks passed 18/18, including all 24 current static routes and 224 reading blocks.
Eight focused detail flows passed; after the final chapter/shortcut corrections,
the three affected flows passed again. The original 29 raw source records remain
unchanged; the approved public-reading corrections are recorded separately.

Homepage checks covered 320, 390, 501, 768 and 1440 px: eight days in correct order,
minimum 44 px day/arrow targets, working selected/today controls and section links,
no overflow. Both final home captures loaded all 21 images without browser errors.
Information-page measurements confirmed 28 px minimum chapter separation, 44 px
topic links, 18.08 px body text, and focused hash destinations. The final marriage
capture checks the intended 19.2 px subsection heading after its specificity fix.

Prior v1/v2 reference images are unchanged. The local preview runs on owned port
3103 for review; the user development server on 3100 and hosted preview remain
separate. The test/capture records do not imply live Google or production release
acceptance.
