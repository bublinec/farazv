Netlify starts here so its automatic installer does not process the application's
dependencies. `../scripts/netlify-build.sh` installs from the repository root
with the pinned Corepack/Yarn toolchain and builds the complete Gatsby site.
The `.nvmrc` symlink shares the Node version used locally and in GitHub Actions.
