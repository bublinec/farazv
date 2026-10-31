import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

export function invalidatePublishedContent() {
  revalidateTag("parish-published", { expire: 0 });
  revalidatePath("/", "layout");
}

/** A committed write remains successful even if cache invalidation fails. */
export function publicationResponse<T extends object>(
  record: T
): T & { cacheWarning?: string } {
  try {
    invalidatePublishedContent();
    return record;
  } catch {
    return {
      ...record,
      cacheWarning:
        "Zmena je uložená. Obnovenie verejnej stránky sa nepodarilo; skúste obnoviť zobrazenie znova."
    };
  }
}
