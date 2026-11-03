import type { BulletinDocument } from "./documents";
import type { RegularSchedule } from "./types";

/** Public-only context; the editor overlays its local draft in the browser. */
export interface BulletinPreviewContext {
  bulletins: (BulletinDocument & { published: true })[];
  regularSchedule: RegularSchedule;
  phone?: string;
}
