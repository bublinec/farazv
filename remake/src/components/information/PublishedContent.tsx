import type { ReactNode } from "react";
import type {
  InformationPageDefinition,
  PublishedInformationSection
} from "@/content/information";
import type { RichTextDocument, RichTextNode } from "@/content/documents";
import type { MediaAsset } from "@/content/types";
import { richTextToPlainText } from "@/lib/rich-text";
import { RichText } from "@/components/editorial/RichText";
import { MediaImage } from "@/components/ui/MediaImage";
import { ImageGallery } from "./ImageGallery";
import { getPublicInformationContent } from "@/content/information-updates";
import { readingHeadingId } from "./ReadingNavigation";
import styles from "./InformationPage.module.css";

function text(node: RichTextNode): string {
  return richTextToPlainText({ type: "doc", content: [node] });
}
const document = (content: RichTextNode[]): RichTextDocument => ({
  type: "doc",
  content
});

/** Server-rendered copy, with only the gallery controls sent as client code. */
function ReadingNodes({
  nodes,
  sectionId
}: {
  nodes: RichTextNode[];
  sectionId: string;
}) {
  const output: ReactNode[] = [];
  let pending: RichTextNode[] = [];
  let headingOrdinal = 0;
  const flush = () => {
    if (pending.length)
      output.push(
        <RichText key={`copy-${output.length}`} document={document(pending)} />
      );
    pending = [];
  };
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.type === "heading") {
      flush();
      headingOrdinal += 1;
      output.push(
        <div
          id={readingHeadingId(sectionId, headingOrdinal)}
          className={styles.readingAnchor}
          tabIndex={-1}
          key={`heading-${index}`}
        >
          <RichText document={document([node])} />
        </div>
      );
    } else if (node.type === "imageGallery") {
      flush();
      output.push(
        <div className={styles.sourceGallery} key={`gallery-${index}`}>
          <ImageGallery images={node.attrs?.images as MediaAsset[]} />
        </div>
      );
    } else if (node.type === "image") {
      flush();
      const image: MediaAsset = {
        src: String(node.attrs?.src),
        alt: String(node.attrs?.alt ?? ""),
        width: Number(node.attrs?.width ?? 1200),
        height: Number(node.attrs?.height ?? 800),
        ...(node.attrs?.caption || node.attrs?.title
          ? { caption: String(node.attrs.caption || node.attrs.title) }
          : {})
      };
      output.push(
        <figure className={styles.sourceImage} key={`image-${index}`}>
          <MediaImage
            image={image}
            fit="contain"
            sizes="(max-width:760px) 100vw, 760px"
          />
          {image.caption ? <figcaption>{image.caption}</figcaption> : null}
        </figure>
      );
    } else pending.push(node);
  }
  flush();
  return output;
}

function visibleNodes(
  section: PublishedInformationSection,
  page: InformationPageDefinition
) {
  const seenCredits = new Set<string>();
  return section.body.content.filter((node) => {
    const value = text(node).trim();
    if (node.type === "paragraph" && /^(?:galéria|galeria)$/i.test(value))
      return false;
    if (
      section.kind === "slides" &&
      (node.type === "image" ||
        (node.type === "heading" &&
          value.toLocaleLowerCase("sk") === page.title.toLocaleLowerCase("sk")))
    )
      return false;
    if (
      node.type === "paragraph" &&
      /^(?:autor:|autorka:|claudia nemcová$)/i.test(value)
    ) {
      const credit = value
        .replace(/^autor(?:ka)?:\s*/i, "")
        .trim()
        .toLocaleLowerCase("sk");
      if (seenCredits.has(credit)) return false;
      seenCredits.add(credit);
    }
    return true;
  });
}

export function PublishedContent({
  page,
  galleryOnly = false
}: {
  page: InformationPageDefinition;
  galleryOnly?: boolean;
}) {
  const source = page.source
    ? getPublicInformationContent(page.source)
    : undefined;
  if (!source || source.placeholderSource) return null;
  const sections = source.sections.filter(
    (section) =>
      section.body.content.length &&
      !["multi_paragraph_image_banners", "partners_sections"].includes(
        section.kind
      ) &&
      (!galleryOnly || section.kind === "galleries")
  );
  const copy = (
    <>
      {sections.map((section, index) => (
        <section
          className={`${styles.copySection} ${
            section.kind === "galleries" ? styles.collection : ""
          }`}
          id={`informacie-${index + 1}`}
          tabIndex={-1}
          key={section.id}
        >
          <ReadingNodes
            nodes={visibleNodes(section, page)}
            sectionId={section.id}
          />
        </section>
      ))}
    </>
  );
  return copy;
}

export function TourFallback({ page }: { page: InformationPageDefinition }) {
  if (!page.source?.unavailableTour) return null;
  return (
    <div className={styles.tourFallback}>
      <h2>Chrám môžete spoznať aj na fotografiách</h2>
      <p>
        Virtuálna prehliadka je dočasne nedostupná. Pozrite si galériu našich
        kostolov alebo dostupné 3D modely.
      </p>
      <a className={styles.textLink} href="/farnost/galeria">
        Otvoriť galériu <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

export function PartnerLinks({ page }: { page: InformationPageDefinition }) {
  const nodes =
    page.source?.sections
      .filter((section) => section.kind === "partners_sections")
      .flatMap((section) => section.body.content) ?? [];
  const pairs: { image: MediaAsset; href: string; label: string }[] = [];
  let image: MediaAsset | undefined;
  for (const node of nodes) {
    if (node.type === "image")
      image = {
        src: String(node.attrs?.src),
        width: Number(node.attrs?.width),
        height: Number(node.attrs?.height),
        alt: String(node.attrs?.alt ?? "")
      };
    else if (image) {
      const href = node.content
        ?.flatMap((child) => child.marks ?? [])
        .find((mark) => mark.type === "link")?.attrs?.href;
      if (typeof href === "string") {
        const label = image.alt || new URL(href, "https://farazv.sk").hostname;
        pairs.push({ image: { ...image, alt: label }, href, label });
        image = undefined;
      }
    }
  }
  if (!pairs.length) return null;
  return (
    <section className={`container ${styles.partners}`}>
      <h2>Sme súčasťou väčšieho spoločenstva</h2>
      <div className={styles.partnerGrid}>
        {pairs.map((partner) => (
          <a
            href={partner.href}
            key={partner.href}
            aria-label={partner.label}
            rel="noopener noreferrer"
          >
            <MediaImage
              image={partner.image}
              fit="contain"
              sizes="(max-width:760px) 40vw, 180px"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
