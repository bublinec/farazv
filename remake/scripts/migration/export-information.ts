import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import prettier from "prettier";
import { buildMigration } from "./build-migration";
import { parseDump } from "./parse-dump";
import type { RichTextNode } from "../../src/content/documents";
import { validateRichText } from "../../src/lib/rich-text";

const { values } = parseArgs({
  options: {
    dump: { type: "string" },
    check: { type: "boolean", default: false },
    output: { type: "string" }
  },
  allowPositionals: false
});
if (!values.dump) {
  throw new Error(
    "Usage: npm run content:generate -- --dump /private/path/dump.sql [--check] [--output path.ts]"
  );
}

const defaultOutput = fileURLToPath(
  new URL("../../src/content/information-content.ts", import.meta.url)
);
const outputPath = values.output ? resolve(values.output) : defaultOutput;
const source = await parseDump(resolve(values.dump));
const migration = buildMigration(source);
const placeholderRoutes = new Set([
  "/spolocenstva/akolyti",
  "/spolocenstva/lektori",
  "/spolocenstva/ruzencove-bratstvo"
]);
let removedTourLinks = 0;
const pages = migration.staticPages
  .filter((page) => page.publishedAt && page.route)
  .map((page) => {
    let unavailableTour = false;
    const blockedTour = (value: unknown): boolean =>
      typeof value === "string" && /wonderful360world\.eu/i.test(value);
    const sanitize = (nodes: RichTextNode[]): RichTextNode[] =>
      nodes.flatMap((node) => {
        // Do not render or advertise the unverified old tour host. The original URL
        // remains in the private migration registry; the public page offers photos.
        if (node.type === "text") {
          let text = node.text ?? "";
          if (blockedTour(text)) {
            unavailableTour = true;
            removedTourLinks += 1;
            text = text
              .replace(
                /https?:\/\/[^\s"<>]*wonderful360world\.eu[^\s"<>]*/gi,
                ""
              )
              .trim();
          }
          const marks = node.marks?.filter((mark) => {
            if (mark.type === "link" && blockedTour(mark.attrs?.href)) {
              unavailableTour = true;
              removedTourLinks += 1;
              return false;
            }
            return true;
          });
          return text ? [{ ...node, text, ...(marks ? { marks } : {}) }] : [];
        }
        if (blockedTour(node.attrs?.src)) {
          unavailableTour = true;
          removedTourLinks += 1;
          return [];
        }
        const content = node.content ? sanitize(node.content) : undefined;
        if (node.content?.length && !content?.length) return [];
        return [
          {
            ...node,
            ...(content ? { content } : {})
          }
        ];
      });
    const placeholderSource = placeholderRoutes.has(page.route!);
    // Legacy Layout used row.content as SEO description, never as reading copy.
    // Some values contain editor instructions; retain those only in provenance.
    const preamble = validateRichText({
      type: "doc",
      content: []
    });
    const sections = placeholderSource
      ? []
      : page.sections.map((section) => ({
          id: `${section.type}-${section.id}`,
          kind: section.type
            .replace(/^components_sections_/, "")
            .replace(/^components_shared_/, ""),
          body: validateRichText({
            type: "doc",
            content: sanitize(section.body.content)
          })
        }));
    return {
      route: page.route!,
      ...(page.cover ? { cover: page.cover } : {}),
      preamble,
      sections,
      ...(unavailableTour ? { unavailableTour: true } : {}),
      ...(placeholderSource ? { placeholderSource: true } : {})
    };
  });
const contents = `import "server-only";\nimport type { PublishedInformationContent } from "./information";\n\n/**\n * Full reading copy/media from the 29 PUBLISHED legacy static pages, reviewed\n * 31 October 2026. Private pages, auth, configuration and submissions are absent.\n * Purpose-specific TSX layouts choose presentation; this is not an editable CMS.\n * Regenerate with scripts/migration/export-information.ts, then review the diff.\n * Placeholder copy and unverified legacy tour links are deliberately excluded.\n */\nexport const publishedInformationContent: PublishedInformationContent[] = ${JSON.stringify(
  pages,
  null,
  2
)};\n`;
// The approved public baseline is intentionally independent of regeneration.
const formatting = await prettier.resolveConfig(defaultOutput);
const formatted = await prettier.format(contents, {
  ...formatting,
  parser: "typescript"
});
if (values.check) {
  const current = await readFile(outputPath, "utf8");
  if (current !== formatted) {
    throw new Error(
      "Static export differs. Regenerate to a separate --output file and review the diff."
    );
  }
} else {
  await writeFile(outputPath, formatted);
}
console.log(
  JSON.stringify({
    publishedStaticPages: pages.length,
    excludedPrivatePages: migration.staticPages.length - pages.length,
    removedTourLinks,
    placeholderPages: pages.filter((page) => page.placeholderSource).length,
    mode: values.check ? "check" : "write",
    bytes: Buffer.byteLength(formatted)
  })
);
