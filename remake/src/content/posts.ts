/** New posts use `news`; historical kinds retain their existing records and URLs. */
export const postRecordKinds = ["news", "event", "notice"] as const;

export function isPostRecordKind(
  kind: string
): kind is (typeof postRecordKinds)[number] {
  return postRecordKinds.includes(kind as (typeof postRecordKinds)[number]);
}

export type AdminListSection = "bulletin" | "posts" | "article";
