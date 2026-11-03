import "server-only";
import { createHash, createHmac } from "node:crypto";
import { isIP } from "node:net";
import { and, count, desc, eq, lt, or, sql } from "drizzle-orm";
import type {
  FeedbackAction,
  FeedbackEntry,
  FeedbackPage,
  FeedbackStatus,
  FeedbackSubmission
} from "@/content/feedback";
import { getDb } from "./db";
import { feedbackRateLimits, visitorFeedback } from "./db/schema";
import { ContentError } from "./errors";
import { feedbackIdPattern } from "./feedback-validation";

function rateBucket(request: Request) {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 32)
    throw new ContentError(
      503,
      "Odosielanie podnetov ešte nie je nakonfigurované.",
      "FEEDBACK_UNAVAILABLE"
    );

  const local = ["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(request.url).hostname
  );
  // Vercel overwrites these forwarding headers. Do not trust client-provided
  // addresses on an unrelated host or use an instance-local counter.
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
      "Odosielanie podnetov je dočasne nedostupné.",
      "FEEDBACK_UNAVAILABLE"
    );

  const hour = Math.floor(Date.now() / 3_600_000);
  return {
    key: createHmac("sha256", secret)
      .update(`visitor-feedback:v1:${hour}:${address}`)
      .digest("hex"),
    expiresAt: new Date((hour + 25) * 3_600_000).toISOString()
  };
}

export async function submitFeedback(
  submission: FeedbackSubmission,
  request: Request
) {
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(submission))
    .digest("hex");
  const bucket = rateBucket(request);

  await getDb().transaction(async (transaction) => {
    // Network retries and simultaneous clicks must not create two messages or
    // consume the visitor's limit twice. The UUID is not a public read token.
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${`feedback:${submission.id}`}, 0))`
    );
    const [existing] = await transaction
      .select({ fingerprint: visitorFeedback.fingerprint })
      .from(visitorFeedback)
      .where(eq(visitorFeedback.id, submission.id))
      .limit(1);
    if (existing) {
      if (existing.fingerprint !== fingerprint)
        throw new ContentError(
          409,
          "Tento podnet už bol odoslaný. Obnovte stránku pre nový podnet.",
          "FEEDBACK_ALREADY_SENT"
        );
      return;
    }

    await transaction
      .delete(feedbackRateLimits)
      .where(lt(feedbackRateLimits.expiresAt, new Date().toISOString()));
    const [limit] = await transaction
      .insert(feedbackRateLimits)
      .values(bucket)
      .onConflictDoUpdate({
        target: feedbackRateLimits.key,
        set: { attempts: sql`${feedbackRateLimits.attempts} + 1` }
      })
      .returning({ attempts: feedbackRateLimits.attempts });
    if (limit.attempts > 5)
      throw new ContentError(
        429,
        "Odoslali ste viac podnetov za krátky čas. Skúste to, prosím, o hodinu.",
        "FEEDBACK_RATE_LIMIT"
      );

    await transaction.insert(visitorFeedback).values({
      id: submission.id,
      topic: submission.details.topic,
      subject: submission.subject,
      email: submission.email || null,
      details: submission.details,
      fingerprint
    });
  });
}

export async function countNewFeedback() {
  const [row] = await getDb()
    .select({ count: count() })
    .from(visitorFeedback)
    .where(eq(visitorFeedback.status, "new"));
  return row.count;
}

export async function listFeedback(
  status: FeedbackStatus,
  encodedCursor?: string
): Promise<FeedbackPage> {
  let cursor: { date: string; id: string } | undefined;
  if (encodedCursor) {
    try {
      if (encodedCursor.length > 500) throw new Error();
      cursor = JSON.parse(Buffer.from(encodedCursor, "base64url").toString());
      if (
        !cursor ||
        typeof cursor.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(
          cursor.date
        ) ||
        !Number.isFinite(Date.parse(cursor.date)) ||
        typeof cursor.id !== "string" ||
        !feedbackIdPattern.test(cursor.id)
      )
        throw new Error();
    } catch {
      throw new ContentError(400, "Neplatné stránkovanie.", "INVALID_CURSOR");
    }
  }

  const [rows, unreadCount] = await Promise.all([
    getDb()
      .select({
        id: visitorFeedback.id,
        topic: visitorFeedback.topic,
        subject: visitorFeedback.subject,
        status: visitorFeedback.status,
        createdAt: visitorFeedback.createdAt,
        preview: sql<string>`left(coalesce(${visitorFeedback.details}->>'problem', ${visitorFeedback.details}->>'message', ''), 180)`
      })
      .from(visitorFeedback)
      .where(
        and(
          eq(visitorFeedback.status, status),
          cursor
            ? or(
                lt(visitorFeedback.createdAt, cursor.date),
                and(
                  eq(visitorFeedback.createdAt, cursor.date),
                  lt(visitorFeedback.id, cursor.id)
                )
              )
            : undefined
        )
      )
      .orderBy(desc(visitorFeedback.createdAt), desc(visitorFeedback.id))
      .limit(21),
    countNewFeedback()
  ]);
  const items = rows.slice(0, 20);
  const last = items.at(-1);
  return {
    items: items.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt).toISOString()
    })),
    unreadCount,
    nextCursor:
      rows.length > 20 && last
        ? Buffer.from(
            JSON.stringify({ date: last.createdAt, id: last.id })
          ).toString("base64url")
        : null
  };
}

export async function getFeedback(id: string): Promise<FeedbackEntry | null> {
  if (!feedbackIdPattern.test(id)) return null;
  const [row] = await getDb()
    .select({
      id: visitorFeedback.id,
      topic: visitorFeedback.topic,
      subject: visitorFeedback.subject,
      email: visitorFeedback.email,
      details: visitorFeedback.details,
      status: visitorFeedback.status,
      createdAt: visitorFeedback.createdAt,
      updatedAt: visitorFeedback.updatedAt
    })
    .from(visitorFeedback)
    .where(eq(visitorFeedback.id, id))
    .limit(1);
  return row
    ? {
        ...row,
        createdAt: new Date(row.createdAt).toISOString(),
        updatedAt: new Date(row.updatedAt).toISOString()
      }
    : null;
}

export async function changeFeedbackStatus(id: string, action: FeedbackAction) {
  if (!feedbackIdPattern.test(id))
    throw new ContentError(404, "Podnet sa nenašiel.", "NOT_FOUND");
  const status = action === "archive" ? "archived" : "reviewed";
  await getDb()
    .update(visitorFeedback)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(
      and(
        eq(visitorFeedback.id, id),
        action === "read" ? eq(visitorFeedback.status, "new") : undefined
      )
    );
  const entry = await getFeedback(id);
  if (!entry) throw new ContentError(404, "Podnet sa nenašiel.", "NOT_FOUND");
  return entry;
}

export async function deleteFeedback(id: string) {
  if (!feedbackIdPattern.test(id))
    throw new ContentError(404, "Podnet sa nenašiel.", "NOT_FOUND");
  await getDb().delete(visitorFeedback).where(eq(visitorFeedback.id, id));
}
