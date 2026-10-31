/** Keep Cloudinary originals intact; generate small delivery variants on demand. */
export function imageUrl(source: string, width: number): string {
  if (!source.startsWith("https://res.cloudinary.com/")) return source;
  return source.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_auto,c_limit,w_${width}/`
  );
}
