import type { CalendarDate, MediaAsset } from "@/content/types";
import { addDays } from "@/lib/calendar";
import { isSafeEditorialLink } from "@/lib/editorial";
import { isSafeLink } from "@/lib/rich-text";
import {
  isTrustedCloudinaryImage,
  LEGACY_CLOUDINARY_CLOUD
} from "@/lib/media-validation";
import { ContentError } from "../errors";

// Preserve the existing draft/publication limits explicitly: a historical draft
// may retain a longer address, but publishing still requires the public limit.
export const settingsTextLimits = {
  field: 500,
  draftAddress: 1000,
  publishedAddress: 500
} as const;

export function isSafePosterDestination(
  value: unknown,
  publishing = false
): value is string {
  return isSafeLink(value) && (!publishing || isSafeEditorialLink(value));
}

export const fail = (message: string, field?: string): never => {
  throw new ContentError(422, message, "INVALID_CONTENT", field);
};

export const text = (value: unknown, max = 500) =>
  typeof value === "string" && value.length <= max;
export const nonempty = (value: unknown, max = 500) =>
  text(value, max) && (value as string).trim().length > 0;
export function isCalendarDate(value: unknown): value is CalendarDate {
  try {
    return (
      typeof value === "string" && addDays(value as CalendarDate, 0) === value
    );
  } catch {
    return false;
  }
}

export function validateMedia(value: unknown): value is MediaAsset {
  if (!value || typeof value !== "object") return false;
  const image = value as MediaAsset;
  const clouds = [
    LEGACY_CLOUDINARY_CLOUD,
    process.env.CLOUDINARY_CLOUD_NAME
  ].filter((name): name is string => !!name);
  const trusted = clouds.some((cloud) =>
    isTrustedCloudinaryImage(image.src, cloud)
  );
  return (
    trusted &&
    Number.isInteger(image.width) &&
    image.width > 0 &&
    image.width <= 50_000 &&
    Number.isInteger(image.height) &&
    image.height > 0 &&
    image.height <= 50_000 &&
    text(image.alt, 1000) &&
    (image.caption === undefined || text(image.caption, 3000))
  );
}

export function requirePublishedMassTimes(
  masses: { time: string }[],
  path?: string
) {
  for (const [index, mass] of masses.entries()) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(mass.time))
      fail(
        "Čas svätej omše musí mať tvar HH:MM.",
        path ? `${path}.${index}.time` : undefined
      );
  }
}

export function asObject(
  value: unknown,
  message: string
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(message);
  return value as Record<string, unknown>;
}

export function asArray(
  value: unknown,
  maximum: number,
  message: string
): unknown[] {
  if (!Array.isArray(value) || value.length > maximum) fail(message);
  return value as unknown[];
}

export function requireText(value: unknown, maximum: number, message: string) {
  if (!text(value, maximum)) fail(message);
}

export function optionalText(value: unknown, maximum: number, message: string) {
  if (value !== undefined) requireText(value, maximum, message);
}

export function keepFields(value: Record<string, unknown>, fields: string[]) {
  for (const key of Object.keys(value))
    if (!fields.includes(key)) delete value[key];
}

export function validateInputBounds(value: unknown) {
  const stack = [{ value, depth: 0 }];
  let nodes = 0;
  while (stack.length) {
    const current = stack.pop()!;
    if (++nodes > 60000 || current.depth > 32)
      fail("Obsah je príliš rozsiahly alebo vnorený.");
    if (current.value && typeof current.value === "object") {
      for (const child of Object.values(current.value))
        stack.push({ value: child, depth: current.depth + 1 });
    }
  }
}

export function draftMasses(value: unknown, regular = false) {
  for (const entry of asArray(value, 30, "Skontrolujte zoznam svätých omší.")) {
    const mass = asObject(entry, "Skontrolujte údaje svätej omše.");
    requireText(mass.time, 5, "Čas svätej omše musí byť text v tvare HH:MM.");
    for (const key of ["celebrant", "intention", "location", "label"])
      optionalText(mass[key], 3000, "Skontrolujte text pri svätej omši.");
    if (regular && (mass.celebrant || mass.intention))
      fail("Pravidelné časy neobsahujú celebrantov ani úmysly.");
    keepFields(mass, ["time", "celebrant", "intention", "location", "label"]);
  }
}

export function draftMedia(value: unknown, allowLocalQr = false) {
  const image = asObject(value, "Vyberte platný obrázok z knižnice.");
  const candidate =
    allowLocalQr && image.src === "/media/donations-qr.png"
      ? {
          ...image,
          src: `https://res.cloudinary.com/${LEGACY_CLOUDINARY_CLOUD}/image/upload/qr.png`
        }
      : image;
  if (!validateMedia(candidate))
    fail("Vyberte platný obrázok z knižnice Cloudinary.");
  keepFields(image, ["src", "width", "height", "alt", "caption"]);
}
