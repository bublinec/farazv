/**
 * Slovak typography: a one-letter word (v, k, s, z, a, o, u, i) must not end
 * a line. Join it to the following word with a non-breaking space.
 */
export function keepShortWordsTogether(text: string) {
  return text.replace(/(?<=^|\s)(\p{L})[ \t]+(?=\S)/gu, "$1 ");
}
