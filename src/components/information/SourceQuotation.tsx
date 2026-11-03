import type { PublishedInformationSection } from "@/content/information";
import type { ReactNode } from "react";
import type { ChurchQuotation } from "@/content/service-quotations";
import { RichText } from "@/components/editorial/RichText";
import { Icon } from "@/components/ui/Icon";
import styles from "./SourceQuotation.module.css";

function QuotationBand({
  quotation,
  attribution,
  id,
  compact = false
}: {
  quotation: ReactNode;
  attribution: ReactNode;
  id?: string;
  compact?: boolean;
}) {
  return (
    <figure
      className={`${styles.band} ${compact ? styles.compact : ""}`}
      id={id}
      tabIndex={id ? -1 : undefined}
    >
      <div className={`container ${styles.quotation}`}>
        <span className={styles.openMark} aria-hidden="true">
          “
        </span>
        <blockquote className={styles.copy}>{quotation}</blockquote>
        <span className={styles.closeMark} aria-hidden="true">
          ”
        </span>
      </div>
      <figcaption className={`container ${styles.attribution}`}>
        <div className={styles.ornament} aria-hidden="true">
          <Icon name="cross" size={25} />
        </div>
        <div>{attribution}</div>
      </figcaption>
    </figure>
  );
}

export function ServiceQuotation({
  quotation
}: {
  quotation: ChurchQuotation;
}) {
  return (
    <QuotationBand
      compact
      quotation={<p>{quotation.text}</p>}
      attribution={<a href={quotation.href}>— {quotation.attribution}</a>}
    />
  );
}

/** Preserve the complete quotation and attribution from the imported source. */
export function SourceQuotation({
  section,
  sourceHref
}: {
  section: PublishedInformationSection;
  sourceHref?: string;
}) {
  const [quotation, ...attribution] = section.body.content;
  // The band already supplies the semantic blockquote around the source text.
  const quotationContent =
    quotation?.type === "blockquote"
      ? quotation.content ?? []
      : quotation
      ? [quotation]
      : [];

  const source = (
    <RichText
      className={styles.inlineCopy}
      document={{ type: "doc", content: attribution }}
    />
  );

  return (
    <QuotationBand
      id="informacie-1"
      quotation={
        <RichText
          className={styles.inlineCopy}
          document={{
            type: "doc",
            content: quotationContent
          }}
        />
      }
      attribution={sourceHref ? <a href={sourceHref}>{source}</a> : source}
    />
  );
}
