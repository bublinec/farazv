import Link from "next/link";
import type { ReactNode } from "react";
import type { RichTextNode } from "@/content/documents";
import type { PageBlock, PageDocument } from "@/content/page-documents";
import { getPageCover } from "@/content/page-photographs";
import type { PresentedReadingNode } from "@/content/information-presentation";
import { PageHero } from "@/components/ui/PageHero";
import { MediaImage } from "@/components/ui/MediaImage";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/editorial/RichText";
import { SacramentsSection } from "@/components/home/SacramentsSection";
import { HospitalMinistrySection } from "@/components/home/HospitalMinistrySection";
import { ReadingNodes } from "./PublishedContent";
import { QuotationBand } from "./SourceQuotation";
import { PageLinks, RelatedPages, Arrow } from "./PageSections";
import { OfficeAside } from "./OfficeAside";
import { CommunityAside } from "./CommunityAside";
import { PreparationTimeline } from "./PreparationTimeline";
import styles from "./InformationPage.module.css";
import reading from "./ReadingContent.module.css";
import editable from "./EditablePage.module.css";
import quotationStyles from "./SourceQuotation.module.css";

type TextBlock = Extract<PageBlock, { type: "text" }>;

function headingNode(text: string, level: number): RichTextNode {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }]
  };
}

/** Number headings inside one block so their reading anchors stay stable. */
function presentNodes(nodes: RichTextNode[]): PresentedReadingNode[] {
  let headingOrdinal = 0;

  return nodes.map((node) => {
    if (node.type === "heading") headingOrdinal += 1;
    return { node, headingOrdinal };
  });
}

function TextBlockView({ block }: { block: TextBlock }) {
  const level = block.titleLevel ?? 2;
  const body = block.body.content;

  if (block.collapsed && block.title) {
    const Heading = `h${level}` as "h2" | "h3";

    return (
      <details
        id={`citanie-${block.id}`}
        className={`${reading.readingAnchor} ${reading.readingDisclosure}`}
      >
        <summary>
          <Heading className={reading.disclosureHeading}>
            <span>{block.title}</span>
            <Icon name="chevron" size={22} />
          </Heading>
        </summary>
        <div className={reading.disclosureContent}>
          <ReadingNodes nodes={presentNodes(body)} sectionId={block.id} />
        </div>
      </details>
    );
  }

  const nodes = block.title?.trim()
    ? [headingNode(block.title, level), ...body]
    : body;
  return <ReadingNodes nodes={presentNodes(nodes)} sectionId={block.id} />;
}

function CardsBlockView({
  block
}: {
  block: Extract<PageBlock, { type: "cards" }>;
}) {
  return (
    <div className={editable.cardsBlock}>
      {block.title ? <h2>{block.title}</h2> : null}
      <ul className={editable.cards} role="list">
        {block.cards.map((card, index) => (
          <li className={editable.card} key={`${card.title}-${index}`}>
            {card.image ? (
              <div className={editable.cardImage}>
                <MediaImage
                  image={card.image}
                  sizes="(max-width:760px) 100vw, 360px"
                />
              </div>
            ) : null}
            <div className={editable.cardCopy}>
              <h3>{card.title}</h3>
              {card.text ? <p>{card.text}</p> : null}
              {card.href ? (
                <Link className={styles.textLink} href={card.href}>
                  {card.linkLabel?.trim() || "Zistiť viac"}{" "}
                  <Arrow diagonal={card.href.startsWith("https://")} />
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Blocks become reading sections. A closed question belongs to the section
 * before it, as in the source-controlled layout.
 */
export function PageBlocks({
  blocks,
  firstSectionNumber = 1
}: {
  blocks: PageBlock[];
  firstSectionNumber?: number;
}) {
  const groups: PageBlock[][] = [];

  for (const block of blocks) {
    const attachToPrevious =
      block.type === "text" && block.collapsed && groups.length > 0;
    if (attachToPrevious) groups[groups.length - 1].push(block);
    else groups.push([block]);
  }

  return (
    <div className={reading.readingCopy}>
      {groups.map((group, index) => (
        <section
          className={reading.copySection}
          id={`informacie-${index + firstSectionNumber}`}
          tabIndex={-1}
          key={group[0].id}
        >
          {group.map(
            (block): ReactNode =>
              block.type === "text" ? (
                <TextBlockView block={block} key={block.id} />
              ) : (
                <CardsBlockView block={block} key={block.id} />
              )
          )}
        </section>
      ))}
    </div>
  );
}

/** Matches the source quotation band, which renders imported paragraphs. */
function InlineCopy({ text }: { text: string }) {
  return (
    <RichText
      className={quotationStyles.inlineCopy}
      document={{
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text }] }]
      }}
    />
  );
}

function EditableHero({ page }: { page: PageDocument }) {
  // The original photograph keeps its reviewed crop/split presentation.
  const original = getPageCover(`/${page.route}`);
  const sameCover = !!page.cover && original?.image.src === page.cover.src;

  return (
    <PageHero
      route={sameCover ? `/${page.route}` : undefined}
      image={sameCover ? undefined : page.cover}
      title={page.title}
      description={page.introduction}
    />
  );
}

function EditableSacramentPage({ page }: { page: PageDocument }) {
  const isAnointing = page.route === "sviatosti/sviatost-pomazania-chorych";
  let preparationType: "baptism" | "marriage" | undefined;
  if (page.route === "sviatosti/sviatost-krstu") preparationType = "baptism";
  if (page.route === "sviatosti/sviatost-manzelstva")
    preparationType = "marriage";

  return (
    <>
      <EditableHero page={page} />
      {page.quotation ? (
        <QuotationBand
          id="informacie-1"
          quotation={<InlineCopy text={page.quotation.text} />}
          attribution={
            page.quotation.href ? (
              <a href={page.quotation.href}>
                <InlineCopy text={`— ${page.quotation.attribution}`} />
              </a>
            ) : (
              <InlineCopy text={`— ${page.quotation.attribution}`} />
            )
          }
        />
      ) : null}
      <div className={`container ${styles.sacramentLayout}`}>
        <div className={styles.sacramentContent}>
          <PageBlocks
            blocks={page.blocks}
            firstSectionNumber={page.quotation ? 2 : 1}
          />
        </div>
        <div className={styles.sacramentSidebar}>
          <PageLinks page={page} />
          <OfficeAside
            preparationType={preparationType}
            title={page.aside?.title}
            description={page.aside?.description}
          />
          {page.preparation?.steps.length ? (
            <PreparationTimeline preparation={page.preparation} />
          ) : null}
        </div>
      </div>

      {isAnointing ? <HospitalMinistrySection /> : null}

      <SacramentsSection />
    </>
  );
}

function EditableServicePage({ page }: { page: PageDocument }) {
  const slug = page.route;

  return (
    <>
      <EditableHero page={page} />
      {page.quotation ? (
        <QuotationBand
          compact
          quotation={<p>{page.quotation.text}</p>}
          attribution={
            page.quotation.href ? (
              <a href={page.quotation.href}>— {page.quotation.attribution}</a>
            ) : (
              <p>— {page.quotation.attribution}</p>
            )
          }
        />
      ) : null}
      <section className={`container ${styles.communityLayout}`}>
        <div>
          <PageBlocks blocks={page.blocks} />
          <PageLinks page={page} />
        </div>
        <CommunityAside page={{ slug, aside: page.aside, facts: page.facts }} />
      </section>
      <RelatedPages page={{ slug, kind: "community" }} />
    </>
  );
}

/** Public view of a page published from the administration. */
export function EditablePage({ page }: { page: PageDocument }) {
  return page.group === "sacrament" ? (
    <EditableSacramentPage page={page} />
  ) : (
    <EditableServicePage page={page} />
  );
}
