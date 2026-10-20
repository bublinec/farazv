#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Install from the application root explicitly, using the same toolchain and
# immutable install as CI. The Netlify base directory has no dependencies.
export COREPACK_ENABLE_AUTO_PIN=0
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export GATSBY_TELEMETRY_DISABLED=1
export YARN_ENABLE_TELEMETRY=0

node --version
corepack enable
corepack prepare "$(node -p 'require("./package.json").packageManager')" --activate
yarn --version
yarn install --immutable --inline-builds
NODE_ENV=production yarn build

test -s public/index.html
cmp static/deploy-check.txt public/deploy-check.txt
cat public/deploy-check.txt
