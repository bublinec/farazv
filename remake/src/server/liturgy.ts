import "server-only";

import { load } from "cheerio/slim";
import { unstable_cache } from "next/cache";
import {
  liturgySourceUrl,
  type DailyLiturgy,
  type GospelVerse
} from "@/content/liturgy";
import type { CalendarDate } from "@/content/types";

const maximumPageBytes = 1_000_000;

function cleanText(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

function parseDailyLiturgy(html: string, date: CalendarDate): DailyLiturgy {
  const $ = load(html);
  const day = $(`#text_${date.replaceAll("-", "")}`);
  if (day.length !== 1) throw new Error("Liturgy source date is missing");

  // Read the summary for each celebration, not its repeated full-text readings.
  // lcVERS also occurs in the psalm, so it must be scoped to lcVPEblock.
  day.find("script, style, .lcFARBA, .lcTYP, [aria-hidden='true']").remove();
  const verses: GospelVerse[] = [];

  day.find(".lcDENalt").each((_, element) => {
    const celebration = $(element);
    const title = cleanText(
      celebration.find(".lcHEAD h2").first().text()
    ).replace(/^PRIKÁZANÁ SLÁVNOSŤ:\s*/iu, "");
    if (!title) return;

    celebration
      .find(".lcHEADinfo")
      .first()
      .find(".lcVPEblock")
      .each((_, block) => {
        const verse = $(block).find(".lcVERS").first().clone();
        verse.find("br").replaceWith(" ");
        const text = cleanText(verse.text());
        if (!text || text.length > 1200) return;

        const variant = cleanText(
          $(block).closest(".lcSEKCIA").children(".lcSEKCIAtitul").text()
        );
        if (
          verses.some(
            (item) => item.text === text && item.celebration === title
          )
        )
          return;

        verses.push({
          text,
          celebration: title,
          ...(variant ? { variant } : {})
        });
      });
  });

  return { date, verses };
}

/** Cache parsed text by its exact date; a provider failure never becomes a cached empty verse. */
export const getDailyLiturgy = unstable_cache(
  async (date: CalendarDate): Promise<DailyLiturgy> => {
    const response = await fetch(liturgySourceUrl(date), {
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
      redirect: "error",
      headers: { Accept: "text/html" }
    });
    if (!response.ok) throw new Error("Liturgy source unavailable");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Liturgy source is empty");

    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > maximumPageBytes) {
          void reader.cancel().catch(() => {});
          throw new Error("Liturgy source is too large");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    return parseDailyLiturgy(
      Buffer.concat(chunks, bytes).toString("utf8"),
      date
    );
  },
  ["kbs-daily-liturgy-v1"],
  { revalidate: 86_400 }
);
