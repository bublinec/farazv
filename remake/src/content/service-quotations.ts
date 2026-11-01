export interface ChurchQuotation {
  text: string;
  attribution: string;
  href: string;
}

const missalSource =
  "https://liturgia.kbs.sk/uploads/kcfinder/files/V%C5%A1eobecn%C3%A9%20smernice%20R%C3%ADmskeho%20mis%C3%A1la.pdf#page=19";

/** Church-document excerpts; the children's passage identifies our translation. */
export const serviceQuotations: Record<string, ChurchQuotation | undefined> = {
  "spolocenstva/detsky-spevokol": {
    text: "Cieľom tohto direktória je pomôcť deťom, aby sa pri eucharistickom slávení ľahko a radostne stretávali s Kristom a spolu s ním stáli pred Otcom.",
    attribution:
      "Direktórium pre omše za účasti detí 55 · preklad z angličtiny",
    href: "https://www.liturgyoffice.org.uk/SOS/DCM.pdf#page=14"
  },
  "spolocenstva/mladeznicky-zbor": {
    text: "Jazyk hudby je aj pastoračným zdrojom, ktorý má osobitný vplyv zvlášť na liturgiu a jej obnovu. Spev môže byť veľkým stimulom pre cestu mladých životom.",
    attribution: "pápež František, Christus vivit 226",
    href: "https://www.kbs.sk/pdf/FR01/FR01ChristusVivit.pdf#page=45"
  },
  "spolocenstva/ministranti": {
    text: "Aj miništranti, lektori, komentátori a členovia speváckeho zboru konajú opravdivú liturgickú službu. Preto nech plnia svoju úlohu s úprimnou nábožnosťou a náležite, […] ako si to Boží ľud od nich právom žiada.",
    attribution: "Sacrosanctum concilium 29",
    href: "https://www.kbs.sk/obsah/sekcia/h/hladat/p/druhy-vatikansky-koncil/c/sacrosanctum-concilium"
  },
  "spolocenstva/lektori": {
    text: "Lektor je ustanovený na prednes čítaní zo Svätého písma okrem evanjelia. […] Lektor má určenú úlohu pri slávení Eucharistie a má ju aj plniť.",
    attribution: "Všeobecné smernice Rímskeho misála 99",
    href: missalSource
  },
  "spolocenstva/akolyti": {
    text: "Akolyta je ustanovený, aby slúžil pri oltári a pomáhal kňazovi i diakonovi. Má na starosti hlavne prípravu oltára a posvätných nádob […].",
    attribution: "Všeobecné smernice Rímskeho misála 98",
    href: missalSource
  }
};
