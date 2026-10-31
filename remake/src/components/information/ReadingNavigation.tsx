import type { InformationPageDefinition } from "@/content/information";
import { getPublicInformationContent } from "@/content/information-updates";
import { richTextToPlainText } from "@/lib/rich-text";
import styles from "./InformationPage.module.css";

/** Stable within a source section; existing informacie-* anchors remain valid. */
export function readingHeadingId(sectionId: string, headingOrdinal: number) {
  return `citanie-${sectionId}-${headingOrdinal}`;
}

export function ReadingNavigation({
  page
}: {
  page: InformationPageDefinition;
}) {
  if (!page.source || page.source.placeholderSource) return null;

  const sections = getPublicInformationContent(page.source).sections.filter(
    (section) =>
      section.body.content.length &&
      !["multi_paragraph_image_banners", "partners_sections"].includes(
        section.kind
      )
  );
  const links = sections.flatMap((section, sectionIndex) => {
    // Slide titles already belong to the page hero, not to reading topics.
    if (section.kind === "slides") return [];
    let headingOrdinal = 0;
    const headings = section.body.content.flatMap((node) => {
      if (node.type !== "heading") return [];
      headingOrdinal += 1;

      const label = richTextToPlainText({ type: "doc", content: [node] });
      if (node.attrs?.level !== 2) return [];

      return [
        { href: `#${readingHeadingId(section.id, headingOrdinal)}`, label }
      ];
    });

    if (
      section.kind === "galleries" &&
      section.body.content.some((node) => node.type === "imageGallery")
    )
      headings.push({
        href: `#informacie-${sectionIndex + 1}`,
        label: "Fotografie"
      });

    return headings;
  });

  // Short pages already have a clear reading path without a second menu.
  if (links.length < 3) return null;

  return (
    <nav className={styles.readingNavigation} aria-label="Na tejto stránke">
      <p>Na tejto stránke</p>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
