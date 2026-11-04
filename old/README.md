# Legacy applications

- [`client/`](client/): the previous Gatsby frontend, including its Yarn lockfile,
  build scripts and Netlify configuration.
- [`admin/`](admin/): the previous Strapi backend/admin, tracked as ordinary files in this repository. Its former standalone Git history
  is preserved only in an ignored local `.private/` backup.

The active Next.js website and its integrated admin live at the repository root.
These archived applications are excluded from its TypeScript checks, formatting
and Vercel uploads. Source and private configuration are preserved. Legacy
dependencies, generated public files and build caches were removed during storage
cleanup; install dependencies again before running an archived application.

Both legacy applications are included in a normal clone; no submodule setup is needed.
Local environment files and credentials are excluded from version control.

The root `netlify.toml` skips automatic legacy builds, keeping the last Netlify
site available during migration. To work on the old frontend, run its commands
from `old/client/` with its own `.nvmrc` and Yarn version. Use isolated data and
credentials for legacy development.

## Hosted reference

The old Gatsby production site remains at [farazv.netlify.app](https://farazv.netlify.app/).
The [saved deployment](https://6ad71e314cf8202580e1a791--farazv.netlify.app/)
is a fixed build reference. Both returned the Gatsby homepage on 3 November 2026.
These are historical references, not the source of current parish notices; their
continued availability depends on the old Netlify account and legacy services.

## Search indexing of the reference site

The archived frontend now supplies `X-Robots-Tag: noindex, follow` through
[`client/static/_headers`](client/static/_headers), plus an HTML robots meta tag
in its shared SEO component. Its static `robots.txt` allows crawling so search
engines can discover the noindex directive. The old robots generator was removed
because its placeholder configuration advertised google.com as the site/sitemap.
These files affect a **new deployment only**, not the already-published archive.

As of 4 November 2026, Netlify access is unavailable and automatic legacy builds
remain disabled. The live reference has **not** received this protection yet.
An account owner can apply it without rebuilding Gatsby or fetching Railway data:

1. Obtain the complete existing published deploy files from Netlify, preserving
   all HTML, page data and assets. Keep a backup of that output.
2. Copy `client/static/_headers` and `client/static/robots.txt` into the root of
   those deploy files (beside `index.html`). Merge any existing `_headers` rules
   instead of discarding them.
3. Publish that complete directory as a new production deploy of the existing
   `farazv` Netlify project. Do not replace it with only the two configuration files.
4. Verify the homepage and a deep page still load and return
   `X-Robots-Tag: noindex, follow`, and that `/robots.txt` allows crawling.

Do not enable automatic legacy builds just to apply these headers. The footer's
reference link can remain. Historical immutable deploy URLs are separate archives;
a new production deploy does not change their headers or HTML. Removal from
search results depends on a search engine revisiting the protected URLs.
