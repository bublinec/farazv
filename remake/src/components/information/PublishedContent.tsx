import type { ReactNode } from "react";
import type { InformationPageDefinition } from "@/content/information";
import {
  getInformationReadingNodes,
  isInformationCredit,
  type PresentedReadingNode
} from "@/content/information-presentation";
import type { RichTextDocument, RichTextNode } from "@/content/documents";
import type { MediaAsset } from "@/content/types";
import { richTextToPlainText } from "@/lib/rich-text";
import { RichText } from "@/components/editorial/RichText";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { ImageGallery } from "./ImageGallery";
import { getPublicInformationContent } from "@/content/information-updates";
import { readingHeadingId } from "./reading-anchors";
import styles from "./InformationPage.module.css";
import reading from "./ReadingContent.module.css";

const document = (content: RichTextNode[]): RichTextDocument => ({
  type: "doc",
  content
});

/** Server-rendered copy, with only the gallery controls sent as client code. */
function ReadingNodes({
  nodes,
  sectionId
}: {
  nodes: PresentedReadingNode[];
  sectionId: string;
}) {
  const output: ReactNode[] = [];
  let pending: RichTextNode[] = [];
  const flush = () => {
    if (pending.length)
      output.push(
        <RichText key={`copy-${output.length}`} document={document(pending)} />
      );
    pending = [];
  };
  for (let index = 0; index < nodes.length; index += 1) {
    const { node, headingOrdinal, collapsed } = nodes[index];
    if (node.type === "heading") {
      flush();
      if (collapsed) {
        const Heading = `h${node.attrs?.level ?? 2}` as
          | "h2"
          | "h3"
          | "h4"
          | "h5"
          | "h6";
        const nextHeading = nodes.findIndex(
          (candidate, nextIndex) =>
            nextIndex > index &&
            candidate.node.type === "heading" &&
            Number(candidate.node.attrs?.level ?? 2) <=
              Number(node.attrs?.level ?? 2)
        );
        const end = nextHeading === -1 ? nodes.length : nextHeading;

        output.push(
          <details
            id={readingHeadingId(sectionId, headingOrdinal)}
            className={`${reading.readingAnchor} ${reading.readingDisclosure}`}
            key={`heading-${index}`}
          >
            <summary>
              <Heading className={reading.disclosureHeading}>
                <span>{richTextToPlainText(document([node]))}</span>
                <Icon name="chevron" size={22} />
              </Heading>
            </summary>
            <div className={reading.disclosureContent}>
              <ReadingNodes
                nodes={nodes.slice(index + 1, end)}
                sectionId={sectionId}
              />
            </div>
          </details>
        );
        index = end - 1;
        continue;
      }

      output.push(
        <div
          id={readingHeadingId(sectionId, headingOrdinal)}
          className={reading.readingAnchor}
          tabIndex={-1}
          key={`heading-${index}`}
        >
          <RichText
            document={document([node])}
            className={reading.headingCopy}
          />
        </div>
      );
    } else if (node.type === "imageGallery") {
      flush();
      output.push(
        <div className={reading.sourceGallery} key={`gallery-${index}`}>
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
        <figure className={reading.sourceImage} key={`image-${index}`}>
          <MediaImage
            image={image}
            fit="contain"
            sizes="(max-width:760px) 100vw, 760px"
          />
          {image.caption ? <figcaption>{image.caption}</figcaption> : null}
        </figure>
      );
    } else if (isInformationCredit(node)) {
      flush();
      output.push(
        <div className={reading.sourceCredit} key={`credit-${index}`}>
          <RichText document={document([node])} />
        </div>
      );
    } else pending.push(node);
  }
  flush();
  return output;
}

export function PublishedContent({
  page,
  galleryOnly = false,
  omitSectionId
}: {
  page: InformationPageDefinition;
  galleryOnly?: boolean;
  omitSectionId?: string;
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
  return (
    <div className={reading.readingCopy}>
      {sections.map((section, index) => {
        const nodes = getInformationReadingNodes(section, page);
        if (section.id === omitSectionId || !nodes.length) return null;

        return (
          <section
            className={reading.copySection}
            id={`informacie-${index + 1}`}
            tabIndex={-1}
            key={section.id}
          >
            <ReadingNodes nodes={nodes} sectionId={section.id} />
          </section>
        );
      })}
    </div>
  );
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
