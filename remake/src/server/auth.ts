import "server-only";
import { PRIVATE_RESPONSE_HEADERS } from "./http";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import {
  AccessError,
  assertGoogleIdentity,
  assertSameOrigin,
  parseEditorAllowlist
} from "@/lib/auth-policy";
import type { EditorIdentity } from "@/lib/auth-policy";
import type { EditorRole } from "@/content/editor-access";
import { getEditorRole } from "./editor-access";

export { AccessError } from "@/lib/auth-policy";
export type AuthorizedEditor = EditorIdentity & { role: EditorRole };

// Keep the persistent session and its encrypted cookie valid for six months.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 180;
export const SESSION_COOKIE_VERSION = "parish-editor-v1";

function authConfiguration() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  let origin: string | undefined;
  try {
    const url = new URL(process.env.BETTER_AUTH_URL ?? "");
    if (
      (url.protocol === "https:" ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    ) {
      origin = url.origin;
    }
  } catch {
    /* Configuration is deliberately checked at request time. */
  }
  if (
    !secret ||
    secret.length < 32 ||
    !clientId ||
    !clientSecret ||
    !origin ||
    parseEditorAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST).size === 0
  ) {
    throw new AccessError(
      503,
      "Prihlásenie ešte nie je nakonfigurované. Obráťte sa na správcu stránky.",
      "AUTH_NOT_CONFIGURED"
    );
  }
  return { secret, clientId, clientSecret, origin };
}

export function isAuthConfigured(): boolean {
  try {
    authConfiguration();
    return true;
  } catch {
    return false;
  }
}

function createAuth(config: ReturnType<typeof authConfiguration>) {
  return betterAuth({
    appName: "Farnosť Zvolen – administrácia",
    baseURL: config.origin,
    secret: config.secret,
    trustedOrigins: [config.origin],
    // Omitting a database intentionally selects Better Auth's stateless mode.
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        prompt: "select_account",
        accessType: "online"
      }
    },
    session: {
      expiresIn: SESSION_MAX_AGE,
      disableSessionRefresh: true,
      cookieCache: {
        enabled: true,
        maxAge: SESSION_MAX_AGE,
        strategy: "jwe",
        refreshCache: false,
        version: SESSION_COOKIE_VERSION
      }
    },
    account: {
      storeStateStrategy: "cookie",
      storeAccountCookie: false,
      accountLinking: { enabled: false }
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (
              user.emailVerified !== true ||
              !(await getEditorRole(user.email.trim().toLowerCase()))
            ) {
              throw new APIError("FORBIDDEN", {
                message: "Tento Google účet nemá prístup do administrácie."
              });
            }
          }
        }
      }
    },
    advanced: {
      cookiePrefix: "farazv",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" }
    }
  });
}

let cached: { key: string; auth: ReturnType<typeof createAuth> } | undefined;

/** Lazy initialization lets public pages/builds work without private OAuth keys. */
export function getAuth() {
  const config = authConfiguration();
  const key = JSON.stringify(config);
  if (!cached || cached.key !== key) cached = { key, auth: createAuth(config) };
  return cached.auth;
}

export async function requireEditorFromHeaders(
  requestHeaders: Headers
): Promise<AuthorizedEditor> {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const identity = assertGoogleIdentity(session);
  const role = await getEditorRole(identity.email);
  if (!role)
    throw new AccessError(
      403,
      "Tento Google účet nemá prístup do administrácie.",
      "EDITOR_NOT_ALLOWED"
    );
  return { ...identity, role };
}

export function assertAdministrator(identity: AuthorizedEditor) {
  if (identity.role !== "admin")
    throw new AccessError(
      403,
      "Prístupy môžu spravovať iba správcovia.",
      "ADMIN_REQUIRED"
    );
}

export async function requireAdministratorPage() {
  const identity = await requireEditorPage();
  if (identity.role !== "admin") {
    const { redirect } = await import("next/navigation");
    redirect("/admin");
  }
  return identity;
}

export async function requireEditor() {
  return requireEditorFromHeaders(new Headers(await headers()));
}

/** Page convenience only: every API still verifies the session independently. */
export async function requireEditorPage() {
  try {
    return await requireEditor();
  } catch (error) {
    if (error instanceof AccessError) {
      const { redirect } = await import("next/navigation");
      redirect(
        error.status === 403 ? "/admin/login?error=access" : "/admin/login"
      );
    }
    throw error;
  }
}

export async function assertEditorRequest(request: Request) {
  const identity = await requireEditorFromHeaders(request.headers);
  assertSameOrigin(request, authConfiguration().origin);
  return identity;
}

export function accessErrorResponse(error: unknown): Response {
  if (error instanceof AccessError) {
    return Response.json(
      { error: error.message, code: error.code },
      {
        status: error.status,
        headers: PRIVATE_RESPONSE_HEADERS
      }
    );
  }
  return Response.json(
    { error: "Požiadavku sa nepodarilo dokončiť. Skúste to znova." },
    {
      status: 500,
      headers: PRIVATE_RESPONSE_HEADERS
    }
  );
}
