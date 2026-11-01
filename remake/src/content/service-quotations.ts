export interface ChurchQuotation {
  text: string;
  attribution: string;
  href: string;
}

const choirQuotation: ChurchQuotation = {
  text: "Hudobná tradícia všeobecnej Cirkvi je poklad neoceniteľnej hodnoty.",
  attribution: "Katechizmus Katolíckej cirkvi 1156",
  href: "https://dkc.kbs.sk/dkc.php?in=kkc1156"
};

const missalSource =
  "https://liturgia.kbs.sk/uploads/kcfinder/files/V%C5%A1eobecn%C3%A9%20smernice%20R%C3%ADmskeho%20mis%C3%A1la.pdf#page=19";

/** Short verbatim excerpts from the linked Slovak Church documents. */
export const serviceQuotations: Record<string, ChurchQuotation | undefined> = {
  "spolocenstva/detsky-spevokol": choirQuotation,
  "spolocenstva/mladeznicky-zbor": choirQuotation,
  "spolocenstva/ministranti": {
    text: "Aj miništranti, lektori, komentátori a členovia speváckeho zboru konajú opravdivú liturgickú službu.",
    attribution: "Sacrosanctum concilium 29",
    href: "https://dkc.kbs.sk/dkc.php?in=sc29"
  },
  "spolocenstva/lektori": {
    text: "Lektor je ustanovený na prednes čítaní zo Svätého písma okrem evanjelia.",
    attribution: "Všeobecné smernice Rímskeho misála 99",
    href: missalSource
  },
  "spolocenstva/akolyti": {
    text: "Akolyta je ustanovený, aby slúžil pri oltári a pomáhal kňazovi i diakonovi.",
    attribution: "Všeobecné smernice Rímskeho misála 98",
    href: missalSource
  }
};
