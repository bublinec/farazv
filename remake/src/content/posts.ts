/** One editorial area, with three reader-facing categories. */
export const postKinds = ["news", "event", "notice"] as const;
export type PostKind = (typeof postKinds)[number];

export const postKindLabels: Record<PostKind, string> = {
  news: "Novinka",
  event: "Podujatie",
  notice: "Oznam"
};

export function isPostKind(kind: string): kind is PostKind {
  return postKinds.includes(kind as PostKind);
}

export type AdminListSection = "bulletin" | "posts" | "article";
