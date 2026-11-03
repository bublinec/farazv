# Legacy applications

- [`client/`](client/): the previous Gatsby frontend, including its Yarn lockfile,
  build scripts and Netlify configuration.
- [`admin/`](admin/): the previous Strapi backend/admin, tracked as ordinary files in this repository. Its former standalone Git history
  is preserved only in an ignored local `.private/` backup.

The active Next.js website and its integrated admin live at the repository root.
These archived applications are excluded from its TypeScript checks, formatting
and Vercel uploads. Their existing local dependencies, caches and private files
have been preserved; they are not part of the active application's deployment.

Both legacy applications are included in a normal clone; no submodule setup is needed.
Local environment files and credentials are excluded from version control.

The root `netlify.toml` skips automatic legacy builds, keeping the last Netlify
site available during migration. To work on the old frontend, run its commands
from `old/client/` with its own `.nvmrc` and Yarn version. Use isolated data and
credentials for legacy development.
