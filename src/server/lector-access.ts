import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import type { LectorPasswordStatus } from "@/content/lector-schedules";
import { AccessError, assertSameOrigin } from "@/lib/auth-policy";
import { siteConfig } from "@/content/site";
import { getDb } from "./db";
import { lectorSecurity, lectorSessions, lectorRateLimits } from "./db/schema";
import { ContentError } from "./errors";
import {
  hashLectorPassword,
  verifyLectorPassword,
  hashLectorToken
} from "./lector-crypto";
import { validateLectorVersion } from "./lector-validation";

const SECURITY_ID = "lectors";
const SESSION_HOURS = 12;
export type LectorTransaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

export function assertLectorOrigin(request: Request) {
  const expected = new URL(process.env.BETTER_AUTH_URL || siteConfig.url)
    .origin;
  assertSameOrigin(request, expected);
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== expected) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new AccessError(
      403,
      "Otvorte rozpis priamo na stránke našej farnosti.",
      "INVALID_ORIGIN"
    );
}

export async function getLectorPasswordStatus(): Promise<LectorPasswordStatus> {
  const [row] = await getDb()
    .select({
      configured: sql<boolean>`${lectorSecurity.passwordHash} is not null`,
      revision: lectorSecurity.revision
    })
    .from(lectorSecurity)
    .where(eq(lectorSecurity.id, SECURITY_ID));
  return row ?? { configured: false, revision: 0 };
}

export async function setLectorPassword(
  password: unknown,
  version: unknown,
  actor: string
): Promise<LectorPasswordStatus> {
  const expected = validateLectorVersion(version);
  const passwordHash = await hashLectorPassword(password);
  return getDb().transaction(async (tx) => {
    await tx
      .insert(lectorSecurity)
      .values({ id: SECURITY_ID })
      .onConflictDoNothing();
    const [current] = await tx
      .select()
      .from(lectorSecurity)
      .where(eq(lectorSecurity.id, SECURITY_ID))
      .for("update");
    if (current.revision !== expected)
      throw new ContentError(
        409,
        "Heslo medzičasom zmenil iný správca. Obnovte nastavenia.",
        "PASSWORD_CONFLICT"
      );

    await tx
      .update(lectorSecurity)
      .set({
        passwordHash,
        revision: current.revision + 1,
        changedBy: actor,
        changedAt: sql`now()`
      })
      .where(eq(lectorSecurity.id, SECURITY_ID));
    await tx.delete(lectorSessions);
    return { configured: true, revision: current.revision + 1 };
  });
}

/** Trust forwarded addresses only on the deployment whose proxy overwrites them. */
async function consumePasswordAttempt(request: Request) {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 32)
    throw new ContentError(
      503,
      "Prístup k rozpisom ešte nie je nastavený.",
      "LECTOR_UNAVAILABLE"
    );
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(request.url).hostname
  );
  const address =
    process.env.VERCEL === "1"
      ? (
          request.headers.get("x-vercel-forwarded-for") ||
          request.headers.get("x-forwarded-for") ||
          ""
        )
          .split(",")[0]
          .trim()
      : local
      ? "127.0.0.1"
      : "";
  if (!isIP(address))
    throw new ContentError(
      503,
      "Prístup k rozpisom je dočasne nedostupný.",
      "LECTOR_UNAVAILABLE"
    );

  const window = Math.floor(Date.now() / 900000);
  const fingerprint = createHmac("sha256", secret)
    .update(`lector-password:v1:${window}:${address}`)
    .digest("hex");
  const expiresAt = new Date((window + 2) * 900000).toISOString();
  const buckets = [
    { key: `global:${window}`, max: 300 },
    { key: `visitor:${window}:${fingerprint}`, max: 10 }
  ];
  await getDb().transaction(async (tx) => {
    await tx
      .delete(lectorRateLimits)
      .where(lt(lectorRateLimits.expiresAt, sql`now()`));
    await tx
      .delete(lectorSessions)
      .where(lt(lectorSessions.expiresAt, sql`now()`));
    for (const bucket of buckets) {
      const [row] = await tx
        .insert(lectorRateLimits)
        .values({ key: bucket.key, expiresAt })
        .onConflictDoUpdate({
          target: lectorRateLimits.key,
          set: { attempts: sql`${lectorRateLimits.attempts}+1` }
        })
        .returning({ attempts: lectorRateLimits.attempts });
      if (row.attempts > bucket.max)
        throw new ContentError(
          429,
          "Príliš veľa pokusov. Počkajte 15 minút a skúste to znova.",
          "PASSWORD_RATE_LIMIT"
        );
    }
  });
}

export async function unlockLectorSchedules(
  password: unknown,
  request: Request
) {
  assertLectorOrigin(request);
  await consumePasswordAttempt(request);
  const [security] = await getDb()
    .select()
    .from(lectorSecurity)
    .where(eq(lectorSecurity.id, SECURITY_ID));
  if (!security?.passwordHash)
    throw new ContentError(
      503,
      "Heslo k rozpisom ešte nie je nastavené. Obráťte sa na správcu farnosti.",
      "LECTOR_NOT_CONFIGURED"
    );
  if (!(await verifyLectorPassword(password, security.passwordHash)))
    throw new AccessError(
      401,
      "Heslo nie je správne. Skúste ho zadať znova.",
      "INVALID_LECTOR_PASSWORD"
    );

  const token = randomBytes(32).toString("base64url");
  await getDb().transaction(async (tx) => {
    // Password rotation takes an exclusive lock on the same row. An old password
    // cannot mint a session for a new revision, even when scrypt finishes later.
    const [current] = await tx
      .select()
      .from(lectorSecurity)
      .where(eq(lectorSecurity.id, SECURITY_ID))
      .for("share");
    if (
      !current ||
      current.revision !== security.revision ||
      current.passwordHash !== security.passwordHash
    )
      throw new AccessError(
        401,
        "Heslo sa medzičasom zmenilo. Zadajte aktuálne heslo.",
        "LECTOR_PASSWORD_CHANGED"
      );
    await tx.insert(lectorSessions).values({
      tokenHash: hashLectorToken(token),
      revision: current.revision,
      expiresAt: sql`now() + interval '12 hours'`
    });
  });
  return { token, expiresIn: SESSION_HOURS * 3600 };
}

function requestTokenHash(request: Request): string {
  assertLectorOrigin(request);
  const header = request.headers.get("authorization");
  if (!header || !/^Bearer [A-Za-z0-9_-]{43}$/.test(header))
    throw new AccessError(
      401,
      "Na otvorenie rozpisu zadajte heslo.",
      "LECTOR_PASSWORD_REQUIRED"
    );
  return hashLectorToken(header.slice(7));
}

export async function withLectorSession<T>(
  request: Request,
  read: (tx: LectorTransaction) => Promise<T>
): Promise<T> {
  const tokenHash = requestTokenHash(request);
  return getDb().transaction(async (tx) => {
    const [session] = await tx
      .select({ tokenHash: lectorSessions.tokenHash })
      .from(lectorSessions)
      .innerJoin(
        lectorSecurity,
        and(
          eq(lectorSecurity.id, SECURITY_ID),
          eq(lectorSecurity.revision, lectorSessions.revision)
        )
      )
      .where(
        and(
          eq(lectorSessions.tokenHash, tokenHash),
          gt(lectorSessions.expiresAt, sql`now()`)
        )
      )
      .for("share");
    if (!session)
      throw new AccessError(
        401,
        "Prístup k rozpisom vypršal. Zadajte heslo znova.",
        "LECTOR_PASSWORD_REQUIRED"
      );
    return read(tx);
  });
}

export async function lockLectorSchedules(request: Request) {
  const tokenHash = requestTokenHash(request);
  await getDb()
    .delete(lectorSessions)
    .where(eq(lectorSessions.tokenHash, tokenHash));
  return { locked: true };
}
