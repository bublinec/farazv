const LITURGY_TYPES = new Map([
  ["prikazana slavnost", "Prikázaná slávnosť"],
  ["prikazany sviatok", "Prikázaný sviatok"],
  ["lubovolna spomienka", "Ľubovoľná spomienka"],
  ["slavnost", "Slávnosť"],
  ["sviatok", "Sviatok"],
  ["spomienka", "Spomienka"],
  ["prvy stvrtok", "Prvý štvrtok"],
  ["prvy piatok", "Prvý piatok"],
  ["prva sobota", "Prvá sobota"],
  ["prva nedela", "Prvá nedeľa"]
]);

const typePattern = [...LITURGY_TYPES.keys()]
  .map((label) => label.replaceAll(" ", "\\s+"))
  .join("|");
const trailingType = new RegExp(`(?:^|[\\s,;:–—-])(${typePattern})[.!]?$`, "i");
const leadingType = new RegExp(`^(${typePattern})\\s*[:–—-]\\s*`, "i");

function clean(value: string) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function plain(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Separate legacy rank/observance labels without rewriting an edited day. */
export function splitLiturgy(
  liturgy?: string,
  liturgyType?: string
): { liturgy?: string; liturgyType?: string } {
  if (liturgyType !== undefined) {
    return {
      liturgy: liturgy ? clean(liturgy) || undefined : undefined,
      // An explicit empty type means the editor deliberately cleared it.
      liturgyType: clean(liturgyType)
    };
  }

  const titles: string[] = [];
  const types: string[] = [];

  for (const part of (liturgy ?? "").split(/[·\r\n]+/)) {
    let title = clean(part);
    const partTypes: string[] = [];

    // Only an explicit separator makes a leading label metadata. In particular,
    // “Spomienka na všetkých zosnulých veriacich” stays a complete day title.
    const leading = plain(title).match(leadingType);
    if (leading) {
      partTypes.push(LITURGY_TYPES.get(clean(leading[1]))!);
      title = title.slice(leading[0].length).trim();
    }

    let trailing = plain(title).match(trailingType);
    const suffixTypes: string[] = [];
    while (trailing) {
      suffixTypes.unshift(LITURGY_TYPES.get(clean(trailing[1]))!);
      title = title.slice(0, trailing.index).replace(/[\s,;:–—-]+$/, "");
      trailing = plain(title).match(trailingType);
    }

    if (title) titles.push(title);
    types.push(...partTypes, ...suffixTypes);
  }

  return {
    liturgy: titles.join(" · ") || undefined,
    liturgyType: [...new Set(types)].join(" · ") || undefined
  };
}
