import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { validateLectorPassword } from "./lector-validation";

const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 32, options, (error, key) =>
      error ? reject(error) : resolve(key)
    )
  );
}

export async function hashLectorPassword(value: unknown): Promise<string> {
  const password = validateLectorPassword(value);
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt);
  return `scrypt-v1$${salt}$${key.toString("hex")}`;
}

export async function verifyLectorPassword(
  value: unknown,
  stored: string
): Promise<boolean> {
  if (
    typeof value !== "string" ||
    [...value].length > 128 ||
    !/^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(stored)
  )
    return false;
  const [, salt, expected] = stored.split("$");
  const key = await derive(value, salt);
  return timingSafeEqual(key, Buffer.from(expected, "hex"));
}

export function hashLectorToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
