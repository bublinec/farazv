import Link from "next/link";
import type { RichTextDocument, RichTextNode } from "@/content/documents";
import { richTextToPlainText } from "@/lib/rich-text";
import { RichText } from "@/components/editorial/RichText";
import { Icon } from "@/components/ui/Icon";
import styles from "./AnointingGuidance.module.css";

const topicTitles = new Set([
  "Prijímateľ sviatosti pomazania chorých",
  "Opakovanie pomazania",
  "Operácia",
  "Starci",
  "Deti",
  "V bezvedomí",
  "Podmienečné pomazanie"
]);

interface GuidanceTopic {
  title?: string;
  content: RichTextNode[];
}

/** Promote the original bold labels; preserve every following paragraph and mark. */
function groupGuidanceTopics(document: RichTextDocument) {
  const topics: GuidanceTopic[] = [];

  for (const node of document.content) {
    const first = node.content?.[0];
    const isLabel =
      node.type === "paragraph" &&
      first?.type === "text" &&
      first.marks?.some((mark) => mark.type === "bold");
    const title =
      node.type === "heading"
        ? richTextToPlainText({ type: "doc", content: [node] }).trim()
        : isLabel
        ? first.text?.trim()
        : undefined;

    if (title && topicTitles.has(title)) {
      const content =
        node.type === "paragraph"
          ? (node.content ?? [])
              .slice(1)
              .map((child, index) =>
                index === 0 && child.type === "text"
                  ? { ...child, text: child.text?.replace(/^\s*[–—-]\s*/, "") }
                  : child
              )
              .filter((child) => child.type !== "text" || child.text)
          : [];

      topics.push({
        title,
        content: content.length ? [{ ...node, content }] : []
      });
      continue;
    }

    if (!topics.length) topics.push({ content: [] });
    topics[topics.length - 1].content.push(node);
  }

  return topics;
}

export function AnointingGuidance({
  document
}: {
  document: RichTextDocument;
}) {
  const topics = groupGuidanceTopics(document);

  return (
    <section
      className={styles.section}
      aria-labelledby="pomazanie-chorych-heading"
    >
      <h2 id="pomazanie-chorych-heading">
        O prijímaní sviatosti pomazania chorých
      </h2>
      <div>
        {topics.map((topic, index) => (
          <section
            className={`${styles.topic} ${
              topic.title ? "" : styles.introduction
            }`}
            key={`${topic.title ?? "uvod"}-${index}`}
          >
            {topic.title ? <h3>{topic.title}</h3> : null}
            <RichText
              document={{ type: "doc", content: topic.content }}
              className={styles.copy}
            />
          </section>
        ))}
      </div>
      <Link
        href="/sviatosti/sviatost-pomazania-chorych"
        className={`textLink ${styles.more}`}
      >
        Viac o sviatosti pomazania chorých <Icon name="arrow-right" size={18} />
      </Link>
    </section>
  );
}
