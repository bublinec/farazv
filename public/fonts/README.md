# Self-hosted webfonts

## Ubuntu

Unmodified Ubuntu 300, 400, 500 and 700 WOFF2 files copied from the public site's
2026-10-20 design archive. The source manifest records their original URLs as
`https://farazv.sk/static/webfonts/s/ubuntu/v21/…`.

Copyright 2011 Canonical Ltd. Licensed under the Ubuntu Font Licence 1.0.
See [UFL.txt](UFL.txt) and [Canonical’s licence](https://canonical.com/legal/font-licence).
They are self-hosted so the preview does not depend on Google Fonts at runtime.

## Source Serif 4

Unmodified TrueType-flavoured variable WOFF2 files from Adobe's
[4.005R release](https://github.com/adobe-fonts/source-serif/releases/tag/4.005R):

- `source-serif-4-variable.woff2` is
  [`SourceSerif4Variable-Roman.ttf.woff2`](https://raw.githubusercontent.com/adobe-fonts/source-serif/4.005R/WOFF2/VAR/SourceSerif4Variable-Roman.ttf.woff2).
- `source-serif-4-variable-italic.woff2` is
  [`SourceSerif4Variable-Italic.ttf.woff2`](https://raw.githubusercontent.com/adobe-fonts/source-serif/4.005R/WOFF2/VAR/SourceSerif4Variable-Italic.ttf.woff2).

Both files include weight and optical-size axes. They retain the full upstream
character set; all Slovak accented letters and common Slovak quotation marks were
checked directly in each downloaded font's character map on 31 October 2026.
See [the official specimen](https://adobe-fonts.github.io/source-serif/).

Copyright 2014–2023 Adobe, with Reserved Font Name “Source”. Distributed under the
SIL Open Font License 1.1; the original [license](SOURCE-SERIF-OFL.txt) is included.
These files are served locally without an Adobe Fonts account or external font
request. The normal and italic fonts are approximately 419 KiB and 339 KiB; browsers
load only the faces actually used by a page.
