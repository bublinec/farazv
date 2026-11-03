import type { Mass } from "@/content/types";

/** Older schedules kept locations separately; show both values without losing either. */
export function getMassLabel(mass: Pick<Mass, "location" | "label">): string {
  return [...new Set([mass.location, mass.label].filter(Boolean))].join(" · ");
}

/** Compare displayed schedule values, independent of JSON property order. */
export function sameMasses(
  left: readonly Mass[] = [],
  right: readonly Mass[] = []
) {
  return (
    left.length === right.length &&
    left.every((mass, index) => {
      const other = right[index];
      return (
        mass.time === other.time &&
        getMassLabel(mass) === getMassLabel(other) &&
        (mass.intention ?? "") === (other.intention ?? "") &&
        (mass.celebrant ?? "") === (other.celebrant ?? "")
      );
    })
  );
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
