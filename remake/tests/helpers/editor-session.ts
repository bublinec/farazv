/** Test fixture only: create the same encrypted and signed cookies Better Auth uses.
 * There is no application endpoint or authentication bypass for this helper.
 */
import { randomUUID } from "node:crypto";
import { makeSignature, symmetricEncodeJWT } from "better-auth/crypto";
import {
  getAuth,
  SESSION_COOKIE_VERSION,
  SESSION_MAX_AGE
} from "../../src/server/auth";

export async function createEditorCookies(options: {
  email: string;
  name?: string;
  emailVerified?: boolean;
  expiresAt?: Date;
  version?: string;
}) {
  const context = await getAuth().$context;
  const now = new Date();
  const token = randomUUID();
  const userId = randomUUID();
  const expiresAt =
    options.expiresAt ?? new Date(now.getTime() + SESSION_MAX_AGE * 1000);
  const payload = {
    session: {
      id: randomUUID(),
      token,
      userId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    },
    user: {
      id: userId,
      email: options.email,
      name: options.name ?? "Testovací redaktor",
      emailVerified: options.emailVerified ?? true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    updatedAt: now.getTime(),
    version: options.version ?? SESSION_COOKIE_VERSION
  };
  const signature = await makeSignature(token, context.secret);
  const data = await symmetricEncodeJWT(
    payload,
    context.secretConfig,
    "better-auth-session",
    SESSION_MAX_AGE
  );
  return [
    {
      name: context.authCookies.sessionToken.name,
      value: encodeURIComponent(`${token}.${signature}`)
    },
    { name: context.authCookies.sessionData.name, value: data }
  ].map((cookie) => ({
    ...cookie,
    url: new URL(process.env.BETTER_AUTH_URL!).origin,
    httpOnly: true,
    secure: context.authCookies.sessionToken.attributes.secure === true,
    sameSite: "Lax" as const
  }));
}

export async function createEditorCookieHeader(
  options: Parameters<typeof createEditorCookies>[0]
) {
  return (await createEditorCookies(options))
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}
