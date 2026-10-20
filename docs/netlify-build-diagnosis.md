# Netlify build diagnosis — 20 October 2026

The Gatsby application builds successfully locally and on clean Linux.
**A full Netlify preview now also succeeds**, using a separate base directory
without application dependencies and an explicit Corepack/Yarn installation
and build script. It serves the current 19–25 October schedule, matches Railway,
and selects 20 October in the browser.

This narrows the original failure to differences in Netlify's automatic
application setup/build context. Its precise internal error remains unknown
because account-protected logs are unavailable. Repository access is available;
Netlify and domain/DNS access are not. The permanent configuration is undergoing
verification before production promotion.
[Successful full preview deployment](https://app.netlify.com/projects/farazv/deploys/6ad71e314cf8202580e1a791).

## Reproduction

An isolated copy of the source was built with an empty Gatsby cache/output,
using the existing installed dependencies through a symlink:

```sh
CI=true GATSBY_TELEMETRY_DISABLED=1 npm run build
```

- Source revision: `3344009`.
- Node: `20.19.6`; installed local Yarn: `4.9.2`.
- Result: exit code 0, 66 pages, approximately 149 seconds.
- Railway sourcing completed successfully.
- The generated schedule includes 19–25 October.
- A separate request to the live deployment still returned 12–18 October as
  its newest week.

This verifies production compilation, queries and static HTML rendering on this
Mac with the installed dependency tree. It does **not** verify a fresh package
installation, Linux/native dependencies, Netlify plugins, account limits or
deployment upload. The existing working tree's Gatsby cache/output were not
used for this build.

Diagnostic files for this session:

- `/tmp/farazv-production-build.log`
- `/tmp/farazv-build-check-m4lr26eb/`
- `/tmp/farazv-attempt-01-linux-build.log`

Attempt 1 subsequently passed a fresh Ubuntu 24.04 installation and production
build with Node 20.19.6 and Yarn 4.9.2 in
[GitHub Actions](https://github.com/bublinec/farazv-client/actions/runs/39386017096).
All 66 pages built, the deployment marker matched, and the manifest/lockfile
were unchanged. The job took 8m58s. Existing plugin compatibility diagnostics
were also emitted on Linux, but did not cause a nonzero build exit.

Netlify's preview for the same source revision failed with no detailed error
available through GitHub. This narrows the investigation to differences in
Netlify's environment or deployment process; it does not identify a specific
cause.

## Findings, in investigation order

### 1. Build-tool versions are not pinned

The original repository has a modern Yarn lockfile, but no `packageManager`
declaration, `.nvmrc`, `.node-version` or `netlify.toml`. Attempt 1 adds
`netlify.toml` on a recovery branch. `.yarnrc.yml` correctly specifies
`nodeLinker: node-modules`.

Netlify can select different Node/Yarn versions from the local machine,
especially on an older project/build image. Its default Yarn comes from the
initial build image unless overridden. Check the install phase of its log.

Once a clean installation/build is verified, commit an exact package-manager
version and a validated Node version. The versions recorded above describe the
diagnostic environment; choosing a maintained long-term toolchain also requires
addressing the dependency compatibility below.

[Netlify dependency configuration](https://docs.netlify.com/build/configure-builds/manage-dependencies/).

### 2. The installed dependency graph has incompatible peer requirements

| Installed package | Declared requirement |
| --- | --- |
| `gatsby@3.15.0` | React/React DOM 16 or 17; installed React/React DOM are 18.3.1 |
| `gatsby-plugin-sharp@4.25.1` | Gatsby 4 |
| `gatsby-source-graphql@4.25.0` | Gatsby 4 |
| `gatsby-plugin-robots-txt@1.8.0` | Gatsby 5 |
| `gatsby-transformer-sharp@3.15.0` | Gatsby 3 and Sharp plugin 3 |

The build logged these mismatches and an unsupported `onPluginInit` API
diagnostic from the Sharp plugin, but still finished successfully. These are
confirmed compatibility problems, **not a reproduced fatal build error**.

Align Gatsby, its plugins and React as a compatible set, regenerate the lockfile
with the chosen package manager, and verify a fresh installation. Avoid a blind
upgrade to the latest version of every package or a blanket force-install flag.

### 3. Netlify's build command, directory and plugin settings are unknown

The normal configuration for this project is:

```toml
[build]
  command = "yarn build"
  publish = "public"
```

Attempt 1 applies this configuration on `fix/netlify-recovery-01`. In particular,
`npm run bd` also invokes a production deploy command; it is inappropriate as
the build command inside Netlify's own deployment pipeline.

Repository `netlify.toml` settings can override corresponding UI settings if
Netlify still builds this repository. They cannot restore account access or
repair a disconnected Git integration.

[Netlify file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/).

### 4. Image processing and external downloads remain possible cloud-only issues

The clean run emitted slow-query warnings for article/church image queries and
generated hundreds of megabytes of output. A constrained cloud build can behave
differently. Relevant log signatures include out-of-memory, exit 137, timeout,
download failures, and Sharp/native-module errors.

Do not increase memory or disable image processing without the failure log.
If the log identifies resource pressure, test lower concurrency and reduce
unnecessary image variants/remote downloads.

### 5. The deploy-preview trigger is confirmed; production settings remain unknown

Initially, the checked GitHub revisions had no commit status entries or check
runs. The repository had no ordinary webhooks or GitHub Actions runs, and its
only listed GitHub deployment record was from 2021.

Opening [PR #4](https://github.com/bublinec/farazv-client/pull/4) automatically
triggered a Netlify deploy preview for commit `d994f0c`. It failed at 09:22:56
Bratislava on 20 October 2026. The GitHub-visible checks contain only a generic
failure and a link to account-protected logs. No build-stage error is exposed.
[Failed Netlify deployment](https://app.netlify.com/projects/farazv/deploys/6ad7168f3f46c4a76304a95f).

This confirms the repository integration and preview trigger work. It does not
establish the production branch configuration or why the build failed. Obtain
the failed deployment's complete log from the Netlify account owner.

## What repository access allows

1. Repair and pin the build toolchain.
2. Commit explicit build configuration after validation.
3. Add a Linux CI build in this repository so future failures have accessible
   logs. First use it as a build check; deployment credentials are unnecessary
   for that check.
4. Prepare a tested fix for the currently connected deployment.

If the Netlify connection still works, a repository change may restore the
existing site. If it does not, someone with the necessary Netlify access must
restore it. A new deployment can be prepared elsewhere, but changing farazv.sk
to serve it requires cooperation from the hosting/domain administrator.

Ask the existing Netlify owner for the complete failed deploy log (including
dependency installation), linked branch, build command, publish directory,
Node/Yarn versions and build-plugin list. An invitation or authorized project
transfer provides a durable way to maintain the site. Netlify documents project
transfers by an authorized Team Owner and support-assisted cases.
[Project transfer documentation](https://docs.netlify.com/manage/projects/transfer-project/).
