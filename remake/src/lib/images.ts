/** Keep Cloudinary originals intact; generate responsive delivery variants on demand. */
export function imageUrl(
  source: string,
  width: number,
  quality: "auto" | "auto:best" = "auto"
): string {
  if (!source.startsWith("https://res.cloudinary.com/")) return source;
  return source.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_${quality},c_limit,w_${width}/`
  );
}
