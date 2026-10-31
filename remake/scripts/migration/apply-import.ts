import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type { MigrationResult } from "./types";
import { getDb } from "../../src/server/db";
import {
  contentRecords,
  importRuns,
  mediaAssets,
  staticSources
} from "../../src/server/db/schema";

/** Source records are content only. Source auth/configuration tables never enter this database. */
export async function importMigration(
  result: MigrationResult,
  options: { dryRun?: boolean } = {}
) {
  const outcome = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    conflicts: [] as string[],
    sourceRemovals: [] as string[],
    media: result.media.length,
    staticPages: result.staticPages.length,
    applied: !options.dryRun
  };
  await getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(17831031)`);
    const existing = await tx.select().from(contentRecords);
    const byId = new Map(existing.map((row) => [row.id, row]));
    const incomingIds = new Set(result.records.map((row) => row.id));
    outcome.sourceRemovals = existing
      .filter((row) => row.source && !incomingIds.has(row.id))
      .map((row) => row.id);
    for (const record of result.records) {
      const current = byId.get(record.id);
      if (
        current &&
        current.source?.hash === record.source?.hash &&
        current.readOnly === record.readOnly
      ) {
        outcome.unchanged++;
        continue;
      }
      if (
        current &&
        (!current.source || current.version !== current.source.importedVersion)
      ) {
        outcome.conflicts.push(record.id);
        continue;
      }
      if (
        current?.publicSlug &&
        record.kind !== "settings" &&
        record.kind !== "bulletin" &&
        record.published &&
        record.published.slug !== current.publicSlug
      ) {
        outcome.conflicts.push(record.id);
        continue;
      }
      const version = current ? current.version + 1 : 1;
      const publishedSlug =
        record.kind !== "settings" &&
        record.kind !== "bulletin" &&
        record.published
          ? record.published.slug || null
          : null;
      const isEligible =
        record.kind === "bulletin" &&
        !!record.published &&
        !record.source?.anomalies?.length;
      const values = {
        id: record.id,
        kind: record.kind,
        title: record.title || "Bez názvu",
        slug: record.slug || null,
        publicSlug: current?.publicSlug ?? publishedSlug,
        draft: record.draft,
        published: record.published,
        version,
        publishedAt: record.published
          ? record.publishedAt ?? new Date().toISOString()
          : null,
        updatedAt: new Date().toISOString(),
        source: record.source
          ? { ...record.source, importedVersion: version }
          : null,
        readOnly: record.readOnly,
        eligibleWeek:
          isEligible && record.kind === "bulletin" && record.published
            ? record.published.weekStart
            : null
      };
      if (options.dryRun) {
        if (current) outcome.updated++;
        else outcome.inserted++;
        continue;
      }

      // Importers share an advisory lock; editor writes intentionally do not.
      // Compare against the version observed above so a later editor save wins.
      const written = current
        ? await tx
            .update(contentRecords)
            .set(values)
            .where(
              and(
                eq(contentRecords.id, record.id),
                eq(contentRecords.version, current.version)
              )
            )
            .returning({ id: contentRecords.id })
        : await tx
            .insert(contentRecords)
            .values(values)
            .onConflictDoNothing({ target: contentRecords.id })
            .returning({ id: contentRecords.id });

      if (!written.length) {
        outcome.conflicts.push(record.id);
        continue;
      }

      if (current) outcome.updated++;
      else outcome.inserted++;
    }
    if (options.dryRun) return;
    for (const media of result.media) {
      const values = {
        id: media.id,
        publicId: media.publicId,
        url: media.url,
        mime: media.mime,
        width: media.width,
        height: media.height,
        alt: media.alt,
        caption: media.caption || null,
        metadata: {
          ...media.metadata,
          sourceId: media.sourceId,
          sourceHash: media.sourceHash
        }
      };
      await tx
        .insert(mediaAssets)
        .values(values)
        .onConflictDoUpdate({ target: mediaAssets.id, set: values });
    }
    for (const page of result.staticPages) {
      const values = {
        id: page.id,
        slug: page.route ?? page.slug,
        publishedAt: page.publishedAt,
        content: page as unknown as Record<string, unknown>
      };
      await tx
        .insert(staticSources)
        .values(values)
        .onConflictDoUpdate({ target: staticSources.id, set: values });
    }
    await tx
      .insert(importRuns)
      .values({ id: randomUUID(), report: { ...result.report, outcome } });
  });
  return outcome;
}
