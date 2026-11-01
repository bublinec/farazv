import type { PublishedInformationSection } from "@/content/information";
import { RichText } from "@/components/editorial/RichText";
import { Icon } from "@/components/ui/Icon";
import styles from "./SourceQuotation.module.css";

/** Present the existing source quotation without rewriting or repeating it. */
export function SourceQuotation({
  section
}: {
  section: PublishedInformationSection;
}) {
  const [quotation, ...attribution] = section.body.content;

  return (
    <figure className={styles.band} id="informacie-1" tabIndex={-1}>
      <div className={`container ${styles.quotation}`}>
        <span className={styles.openMark} aria-hidden="true">
          “
        </span>
        <RichText
          className={styles.inlineCopy}
          document={{
            type: "doc",
            content: quotation ? [quotation] : []
          }}
        />
        <span className={styles.closeMark} aria-hidden="true">
          ”
        </span>
      </div>
      <figcaption className={`container ${styles.attribution}`}>
        <div className={styles.ornament} aria-hidden="true">
          <span />
          <Icon name="cross" size={24} />
          <span />
        </div>
        <RichText
          className={styles.inlineCopy}
          document={{ type: "doc", content: attribution }}
        />
      </figcaption>
    </figure>
  );
}
