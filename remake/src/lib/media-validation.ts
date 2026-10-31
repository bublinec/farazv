export const LEGACY_CLOUDINARY_CLOUD = "dmx3wfvko";
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const UPLOAD_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif"
] as const;

export function isTrustedCloudinaryImage(
  src: unknown,
  cloudName: string
): src is string {
  if (typeof src !== "string" || !/^[a-zA-Z0-9_-]+$/.test(cloudName))
    return false;
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.startsWith(`/${cloudName}/image/upload/`) &&
      !/\.(?:svg|pdf)(?:$|\/)/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function canonicalCloudinaryImage(
  cloudName: string,
  publicId: string,
  version: number,
  format: string
): string {
  if (
    !/^[a-zA-Z0-9_-]+$/.test(cloudName) ||
    !/^[a-zA-Z0-9_/-]+$/.test(publicId) ||
    publicId
      .split("/")
      .some((part) => !part || part === "." || part === "..") ||
    !Number.isSafeInteger(version) ||
    version < 1 ||
    !UPLOAD_FORMATS.includes(format as (typeof UPLOAD_FORMATS)[number])
  ) {
    throw new Error("Neplatný odkaz na obrázok.");
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/v${version}/${publicId}.${format}`;
}
