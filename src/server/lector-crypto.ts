import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function verifyLectorPasscode(
  value: unknown,
  expected: string
): boolean {
  if (typeof value !== "string" || [...value].length > 128) return false;

  const digest = (text: string) => createHash("sha256").update(text).digest();
  return timingSafeEqual(digest(value), digest(expected));
}

export function hashLectorSessionToken(
  token: string,
  passcode: string
): string {
  return createHmac("sha256", passcode)
    .update("lector-session:v2:")
    .update(token)
    .digest("hex");
}
