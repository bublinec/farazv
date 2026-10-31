# Design v1 · preserved reference

Captured on 31 October 2026, before the parish character design revision. This is
the quieter blue, gold and Ubuntu design that followed the implementation
refactor. It remains available for comparison and selective restoration.

- [Source archive](source.tar.gz): 68 public presentation files, including the
  bundled Ubuntu fonts and their license.
- [File manifest](manifest.json): individual SHA-256 hashes and the archive hash.
- [Capture metadata](captures.json): routes, viewports and image checksums. All
  six captures loaded their images successfully.

The archive preserves public routes, layout components, CSS, photo references,
navigation and layout definitions. It excludes admin, APIs, server code, local
configuration, credentials, SQL, imported reading-copy exports and editorial
fixtures. Those unchanged content and backend modules remain in the repository.
This is a presentation checkpoint, not a standalone application or database
backup.

## Review or restore

From the repository root, inspect the archive and extract it into a temporary
directory before selecting files to restore:

```sh
shasum -a 256 docs/remake/design-history/v1/source.tar.gz
tar -tzf docs/remake/design-history/v1/source.tar.gz
design_restore=$(mktemp -d /tmp/farazv-design-v1.XXXXXX)
tar -xzf docs/remake/design-history/v1/source.tar.gz -C "$design_restore"
```

Compare the extracted public files against the current application. Restore only
the intended presentation files, preserving subsequent content and behavior
changes. Extra files introduced by later designs are not removed by extraction.

The archive SHA-256 is
`8bdeb76c28ec29a8d885ebfd692e171f371c534a3273d3a7021e8a96a8e495b4`.

## Reference captures

| Page                            | Desktop · 1440 px           | Mobile · 390 px            |
| ------------------------------- | --------------------------- | -------------------------- |
| Homepage                        | [View](home-desktop.jpg)    | [View](home-mobile.jpg)    |
| St Elizabeth church and history | [View](history-desktop.jpg) | [View](history-mobile.jpg) |
| Baptism                         | [View](baptism-desktop.jpg) | [View](baptism-mobile.jpg) |

Use the captured v1 source with the same repository dependencies and content
adapters. Screenshots use fixture content, a fixed date of `2026-10-31`, Slovak
locale and Bratislava time. External Cloudinary images remain remote references;
their availability is outside this archive.

The capture command requires an explicitly owned local server, then writes only
reference images and capture metadata in this directory:

```sh
node docs/remake/design-history/v1/capture.mjs http://127.0.0.1:3104
```

Do not run this against a later design and relabel its output as v1. Screenshots
are a visual record; the source archive and manifest are the restoration record.
