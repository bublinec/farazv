import type { MediaAsset } from "./types";

/** Original public homepage banner and summaries, retained verbatim. */
export const sacramentSummaries = [
  {
    title: "Sviatosť krstu",
    description:
      "Svätý krst je základom celého kresťanského života, vstupnou bránou do života v Duchu, ako aj bránou, ktorá otvára prístup k ostatným sviatostiam.",
    href: "/sviatosti/sviatost-krstu"
  },
  {
    title: "Sviatosť Eucharistie",
    description:
      "Eucharistia je prameň a vrchol celého kresťanského života. Obsahuje celé duchovné dobro Cirkvi, totiž samého Krista.",
    href: "/sviatosti/sviatost-eucharistie"
  },
  {
    title: "Sviatosť birmovania",
    description:
      "Birmovanie zdokonaľuje krstnú milosť. Je to sviatosť, ktorá dáva Ducha Svätého, aby nás hlbšie zakorenil v Božom synovstve a pomáhal nám vydávať svedectvo o kresťanskej viere.",
    href: "/sviatosti/sviatost-birmovania"
  },
  {
    title: "Sviatosť manželstva",
    description:
      "Sviatosť manželstva je znakom spojenia Krista a Cirkvi. Milosť sviatosti zdokonaľuje ľudskú lásku manželov, posilňuje ich nerozlučiteľnú jednotu a posväcuje ich na ceste do večného života.",
    href: "/sviatosti/sviatost-manzelstva"
  },
  {
    title: "Sviatosť zmierenia",
    description:
      "Hriech je predovšetkým prerušením spoločenstva s Bohom. Pokánie – obrátenie prináša súčasne Božie odpustenie a zmierenie s Cirkvou, čo liturgicky vyjadruje a uskutočňuje sviatosť zmierenia.",
    href: "/sviatosti/sviatost-zmierenia"
  },
  {
    title: "Pomazanie chorých",
    description:
      "Cirkev verí a vyznáva, že medzi siedmimi sviatosťami je jedna sviatosť osobitne určená na to, aby posilňovala tých, čo sú skúšaní chorobou. Je to sviatosť pomazania chorých.",
    href: "/sviatosti/sviatost-pomazania-chorych"
  }
] as const;

/** Original public site asset window.png; no photographer was recorded. */
export const sacramentsBackground: MediaAsset = {
  src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1636898013/window_edb30a4d4a.png",
  width: 1440,
  height: 512,
  alt: "Vitráž v Kostole sv. Alžbety vo Zvolene"
};
