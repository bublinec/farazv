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
