import type { EditorialRecordKind } from "@/content/documents";
import { postKindLabels } from "@/content/posts";
import styles from "./PostBadge.module.css";

export function PostBadge({ kind }: { kind: EditorialRecordKind }) {
  return (
    <span className={`${styles.badge} ${styles[kind]}`}>
      {kind === "article" ? "Článok" : postKindLabels[kind]}
    </span>
  );
}
