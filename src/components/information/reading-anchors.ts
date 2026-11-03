/** Stable within a source section; existing informacie-* anchors remain valid. */
export function readingHeadingId(sectionId: string, headingOrdinal: number) {
  return `citanie-${sectionId}-${headingOrdinal}`;
}
