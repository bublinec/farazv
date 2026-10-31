import type { Mass } from "@/content/types";

/** Older schedules kept locations separately; show both values without losing either. */
export function getMassLabel(mass: Pick<Mass, "location" | "label">): string {
  return [...new Set([mass.location, mass.label].filter(Boolean))].join(" · ");
}

/** Short carousel names; keep the complete name in the saved schedule. */
export function formatCelebrantName(name?: string): string {
  return (name ?? "")
    .replace(
      /\b(?:Mgr|Ing|Bc|ThDr|PhDr|PaedDr|RNDr|JUDr|MUDr|MDDr|MVDr|Dr|ThLic|PhLic|ICLic|ICDr|PhD|ThD|DrSc|CSc|DiS|prof|doc|Mons)\.(?:\s*art\.)?/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .replace(/^[\s,;]+|[\s,;]+$/g, "");
}
