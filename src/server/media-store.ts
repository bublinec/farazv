import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, ilike, lt, or } from "drizzle-orm";
import type { MediaAsset } from "@/content/types";
import { getDb } from "./db";
import { mediaAssets } from "./db/schema";

export async function listMedia(
  options: { query?: string; cursor?: string } = {}
) {
  const rows = await getDb()
    .select()
    .from(mediaAssets)
    .where(
      and(
        ilike(mediaAssets.mime, "image/%"),
        options.query
          ? or(
              ilike(
                mediaAssets.alt,
                `%${options.query.slice(0, 150).replace(/[\\%_]/g, "\\$&")}%`
              ),
              ilike(
                mediaAssets.publicId,
                `%${options.query.slice(0, 150).replace(/[\\%_]/g, "\\$&")}%`
              )
            )
          : undefined,
        options.cursor
          ? lt(mediaAssets.id, options.cursor.slice(0, 200))
          : undefined
      )
    )
    .orderBy(desc(mediaAssets.id))
    .limit(25);
  return {
    items: rows
      .slice(0, 24)
      .filter((row) => row.width && row.height)
      .map((row) => ({
        src: row.url,
        width: row.width!,
        height: row.height!,
        alt: row.alt,
        ...(row.caption ? { caption: row.caption } : {})
      })),
    nextCursor: rows.length > 24 ? rows[23].id : null
  };
}

export async function registerMediaAsset(
  asset: MediaAsset & { publicId?: string; format?: string; bytes?: number }
) {
  await getDb()
    .insert(mediaAssets)
    .values({
      id: asset.publicId ?? randomUUID(),
      publicId: asset.publicId,
      url: asset.src,
      mime: `image/${asset.format || "jpeg"}`,
      width: asset.width,
      height: asset.height,
      alt: asset.alt,
      caption: asset.caption,
      metadata: { bytes: asset.bytes ?? null }
    })
    .onConflictDoNothing();
}
