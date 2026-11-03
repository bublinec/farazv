import type { MediaAsset } from "./types";

/** Dedicated restoration appeal, distinct from the account for everyday parish life. */
export const altarRestoration = {
  title: "Obnova oltárov v kaplnke",
  href: "/farnost/obnova-oltarov",
  sectionId: "obnova-oltarov",
  postSlug: "pomozme-spolu-zrestaurovat-oltar-1",
  iban: "SK53 1111 0000 0066 1528 6057",
  goal: "82 000 €",
  letter: {
    title: "Poďakovanie a forma pomoci",
    paragraphs: [
      "Drahí bratia, sestry a všetci dobrodinci, touto cestou Vám chcem vyjadriť svoju vďačnosť za Vašu pomoc. Vaša štedrosť je pre celé naše farské spoločenstvo prejavom Božej dobroty, lebo Vaše milodary sú nádejou, že sa nám podarí zreštaurovať aj posledný z trojice oltárov, oltár sv. Jozefa. Všetky tri oltáre sú jedinečným skvostom nášho farského kostola.",
      "Svoju vďaku s prosbou o Božie požehnanie a ochranu pre každého, kto pomohol a pomáha akýmkoľvek spôsobom, vkladáme do modlitieb. Každý mesiac, vždy sedemnásteho, sa v kostole sv. Alžbety spoločne modlíme za našich dobrodincov a obetujeme za nich svätú omšu. Veríme, že dobrotivý Pán bohato odmení a zahrnie všetkých darcov a dobrodincov svojim požehnaním a milosrdnou láskou. Pán Boh vám zaplať a požehnaj!",
      "Aby mohol byť oltár sv. Jozefa zreštaurovaný, potrebujeme vyzbierať sumu 82 000€. Svoje milodary aj naďalej môžete zasielať na transparentný účet našej farnosti, ktorý bol zriadený k tomuto účelu v UniCredit Bank: SK53 1111 0000 0066 1528 6057, alebo aj osobne podľa svojich možností."
    ],
    closing: "Ďakujeme!",
    signature: "Jozef Kraus, dekan"
  },
  photograph: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551071/IMG_3168_78eb1d97d5.jpg",
    width: 1024,
    height: 1536,
    alt: "Barokové oltáre v Mariánskej kaplnke pri Kostole sv. Alžbety"
  } satisfies MediaAsset,
  homepagePhotograph: {
    src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638551115/IMG_3196_3863d76145.jpg",
    width: 1024,
    height: 1536,
    alt: "Oltár sv. Jozefa v Kostole sv. Alžbety vo Zvolene"
  } satisfies MediaAsset
};
