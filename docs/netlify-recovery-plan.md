# Netlify recovery plan

Status: recovery continues autonomously on `fix/netlify-recovery-01` in
[draft PR #4](https://github.com/bublinec/farazv-client/pull/4), following the
user's authorization to restore current content. Attempts 1–3 failed Netlify
preview. Clean Linux builds are being compared with those results. Nothing has
been merged to `main`; further work uses `/tmp/farazv-recovery-live` to avoid
interfering with concurrent changes in the original checkout.

Goal: publish a fresh, working build at `https://farazv.sk/` while preserving the
current site. Each attempt should be a separate, reversible commit.

Baseline: the existing installed dependencies produced 66 pages successfully
with Node 20.19.6 and a fresh Gatsby cache. This did not test fresh dependency
installation or Linux. Railway had the 19–25 October schedule; production still
served 12–18 October on 20 October 2026.

## Before the first production attempt: make results observable

- Keep the successful baseline and its log.
- Add a GitHub Actions build check using a clean Ubuntu checkout, exact tool
  versions, `yarn install --immutable`, and `yarn build`, with no restored Gatsby
  cache for the first run. Save the build log. No deployment token is needed.
- Initially reproduce the observed environment with Yarn 4.9.2 and Node
  20.19.6. Node 20 is a temporary diagnostic baseline, not the intended
  long-term toolchain. Test a maintained Node version in attempt 3.
- If installation/build fails, address that specific failure before pushing
  speculative production fixes. The diagnostic workflow's versions can be
  explicit without changing the application's version declarations yet.
- With every production attempt, update `static/deploy-check.txt` to a unique
  value such as `farazv-recovery-01`.
- After the change is pushed to the intended production branch, request
  `/deploy-check.txt?attempt=01` and compare its exact body with the expected
  value. Also inspect any GitHub deployment checks.

A new marker proves new output was published. An unchanged/missing marker does
not tell us whether the build failed, was skipped, or was never triggered.
Allow a reasonable observation window (initially 15 minutes), but do not treat
that time limit as proof of a failed build or disconnected integration.

Once a marker appears, check the homepage, weekly notices, a dynamic article,
images and mobile navigation. Verify that the schedule matches current Railway
content. Stop experimenting once the live deployment is healthy.

## Attempt 1 — Override the build command and publish directory

Add a root `netlify.toml`:

```toml
[build]
  command = "yarn build"
  publish = "public"
```

Hypothesis: the dashboard has an incorrect command/output directory. This also
ensures Netlify runs the build script rather than `bd`, which contains a nested
deployment command.

Validation: clean build check passes; generated output contains the marker;
the live marker changes and current content appears.

Keep this configuration if it is valid even if the site does not change; that
result alone cannot establish whether Netlify read it.

[Netlify configuration precedence](https://docs.netlify.com/build/configure-builds/file-based-configuration/).

## Attempt 2 — Pin the Yarn version

After verifying a clean install with it, add this top-level `package.json` field:

```json
"packageManager": "yarn@4.9.2"
```

Keep the existing `.yarnrc.yml` setting:

```yaml
nodeLinker: node-modules
```

Hypothesis: Netlify's older/default Yarn cannot reproduce the committed modern
Yarn lockfile. Do not change package versions or regenerate the lockfile unless
the immutable-install check identifies a specific inconsistency.

Validation: fresh `yarn install --immutable` and production build pass, followed
by the live marker/content check.

[Netlify Yarn selection](https://docs.netlify.com/build/configure-builds/manage-dependencies/).

## Attempt 3 — Pin a validated Node version

Test the latest Node 22 patch in the clean Linux build while keeping Yarn and
dependencies unchanged. If it passes, record that exact patch in `.nvmrc` and
use the same version in the build check.

Hypothesis: Netlify is using a different Node runtime from the tested one.
If Node 22 fails, use the error to decide the next compatibility repair; do not
pin an untested version merely because it is newer.

Compare with Node 20.19.6 only as a diagnostic baseline. A temporary rollback to
that environment would need a separate decision rather than silently making it
the long-term production setting.

Validation: clean installation, production build and live marker/content check.
If Netlify still differs, its actual environment/version-selection log is
needed; configuration precedence may involve an existing `NODE_VERSION`.

## Decision point after attempts 1–3

If clean Linux builds pass but there is still no production marker, obtain a
Netlify build log or help from the account owner before making larger changes.
The problem may be the repository/branch connection, paused builds, account
limits, a Netlify plugin, or deployment upload.

Only repository access is currently available. Code cannot restore account
access or change the domain's destination. Continue with the following
attempts when a build failure gives us evidence that they are relevant.

## Attempt 4 — Repair the dependency compatibility group

If installation or Gatsby plugin initialization fails, keep Gatsby 3 for this
recovery and test these exact candidate versions:

| Package | Candidate version |
| --- | --- |
| `gatsby` | `3.15.0` (same version currently resolved) |
| `gatsby-plugin-sharp` | `3.15.0` |
| `gatsby-source-graphql` | `3.15.0` |
| `gatsby-plugin-robots-txt` | `1.5.1` |
| `react` | `17.0.2` |
| `react-dom` | `17.0.2` |

The candidates' existence and peer requirements were checked against the npm
registry on 20 October 2026. The two Gatsby plugins declare Gatsby 3 support;
the robots plugin accepts Gatsby >2; React DOM 17.0.2 requires React 17.0.2.
This is a proposed compatible direction, not a validated complete dependency
graph.

Treat mutually dependent package changes as one compatibility repair. Inspect
the remaining peer requirements, regenerate `yarn.lock` with the pinned Yarn,
review its diff, and run a fresh installation/build plus browser smoke checks.
Do not upgrade the framework to Gatsby 5 in the same recovery attempt.

Keep both CMS integrations: Strapi REST sourcing and `gatsby-source-graphql`
are used by this application's queries.

## Attempt 5 — Clear Gatsby's build cache once

Use only if the log suggests stale schema, cached artifacts, or a cache-related
failure. Temporarily change the Netlify command to:

```toml
[build]
  command = "yarn gatsby clean && yarn build"
  publish = "public"
```

This clears Gatsby output/cache during the build; it does not reset Netlify's
dependency cache or repair a failed install. Expect a slower build with more
downloads. After a successful recovery, restore `yarn build` in a separate
follow-up and verify it.

## Attempt 6 — Reduce resource pressure

Use if logs identify out-of-memory, exit 137, or overloaded image processing.
Start by adding only:

```toml
[build.environment]
  GATSBY_CPU_COUNT = "2"
```

If logs instead identify too many concurrent remote downloads, test
`GATSBY_CONCURRENT_DOWNLOAD = "10"` as a separate sub-attempt. Both variables
exist in the installed Gatsby dependencies.

Expect reduced peak pressure but potentially longer builds. Do not blindly
raise heap limits, disable images, ignore errors, or add download timeout
overrides without matching evidence.

## Attempt record

### Attempt 1 — 20 October 2026

- Commit: `d994f0c4140b236c74a694b9ab29dd5fcef0834d`.
- Change: explicit `yarn build` / `public` Netlify settings, marker
  `farazv-recovery-01`, and a clean Linux diagnostic workflow.
- Local result: `yarn build` passed for 66 pages using the existing installed
  dependencies; the generated marker matched the source exactly.
- Clean Linux result: immutable installation and production build passed with
  Node 20.19.6 and Yarn 4.9.2. All 66 pages built, the marker matched, and
  `package.json` / `yarn.lock` remained unchanged. The full job took 8m58s.
  [GitHub Actions run](https://github.com/bublinec/farazv-client/actions/runs/39386017096).
- Netlify preview: triggered automatically by the PR, then reported
  `Deploy Preview failed.` at 09:22:56 Bratislava. This confirms the GitHub
  connection is active. GitHub checks expose no underlying error; the header
  and redirect check names do not identify the failure's cause.
  [Netlify deployment](https://app.netlify.com/projects/farazv/deploys/6ad7168f3f46c4a76304a95f).
- Live marker/content: not tested for this commit because it has not been
  merged to the production branch.
- Decision: retain the valid configuration on the recovery branch; do not
  promote the failed preview or start attempt 2 in the same change.
- Next isolated attempt: declare `packageManager: "yarn@4.9.2"` as described
  above. This is now backed by a successful fresh Linux install/build, but
  remains a hypothesis about Netlify's unknown package-manager selection.

### Attempt 2 — Pin Yarn

- Commit: `5ca9505bb2f2596a0f291c36b1a39cbe7eddeabd`.
- Change: `packageManager: "yarn@4.9.2"` and marker `farazv-recovery-02`.
- Netlify preview failed after approximately 1m44s, still without a specific
  error exposed in GitHub.
  [Deployment](https://app.netlify.com/projects/farazv/deploys/6ad71944b08ba5290724f9a1).
- Clean Linux installation passed; production build result is tracked in
  [this run](https://github.com/bublinec/farazv-client/actions/runs/39387285624).

### Attempt 3 — Pin Node

- Commit: `706cb976e3f548720a450d9ab6de3fac30c2d23c`.
- Change: `.nvmrc` selects Node 22.23.3, GitHub reads that same file, and marker
  becomes `farazv-recovery-03`.
- Netlify preview failed. A later documentation-only commit (`921b92d`) also
  triggered a failed preview.
  [Deployment](https://app.netlify.com/projects/farazv/deploys/6ad71a6e0afe13007159147a).
- Clean Linux installation passed on Node 22; production build result is
  tracked in [this run](https://github.com/bublinec/farazv-client/actions/runs/39387835763).

### Additional isolation — Netlify's Gatsby build plugin

Before changing application dependencies that already build on Linux, test
`NETLIFY_SKIP_GATSBY_BUILD_PLUGIN = "true"` in deploy previews only, with marker
`farazv-recovery-04-plugin`. The ordinary Gatsby build command still runs.
Current official plugin source recognizes this flag. The project does not use
Gatsby SSR/DSG or API functions. This test separates the application's build
from Netlify's additional Gatsby hooks; it does not skip dependency setup or
the plugin package's own installation/loading.

[Official plugin implementation](https://github.com/netlify/netlify-plugin-gatsby/blob/main/plugin/src/helpers/config.ts).

For each attempt, record the commit SHA, single hypothesis, exact change,
clean-install result, build result, expected/live marker, content check and
keep/revert decision. Stop on a local regression; revert the failing attempt
before trying another unrelated change.

If the existing integration cannot publish, the recovery path requires the
Netlify owner to restore access/connection or the domain administrator to help
with a replacement deployment.
