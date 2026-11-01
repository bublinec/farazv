import "server-only";
import type { RichTextDocument } from "./documents";
import type { MediaAsset } from "./types";
import { publishedInformationContent } from "./information-content";

/** Purpose-specific page structure, with full published source reading copy. */
export interface PublishedInformationSection {
  id: string;
  kind: string;
  body: RichTextDocument;
}
export interface PublishedInformationContent {
  route: string;
  cover?: MediaAsset;
  preamble: RichTextDocument;
  sections: PublishedInformationSection[];
  unavailableTour?: boolean;
  placeholderSource?: boolean;
}
export interface InformationSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

export interface InformationLink {
  label: string;
  href: string;
  description?: string;
}

interface InformationPageLayout {
  slug: string;
  title: string;
  eyebrow: string;
  introduction: string;
  kind:
    | "sacrament"
    | "church"
    | "community"
    | "school"
    | "contact"
    | "gallery"
    | "tour"
    | "resource";
  facts?: { label: string; value: string }[];
  links?: InformationLink[];
  timeline?: { year: string; title: string; text: string }[];
  credit?: string;
  models?: { id: string; title: string }[];
}

export type InformationPageDefinition = InformationPageLayout &
  (
    | {
        contentSource: "published";
        source: PublishedInformationContent;
        sections?: never;
      }
    | {
        contentSource: "curated";
        sections: InformationSection[];
        source?: never;
      }
  );

type InformationPageConfiguration = InformationPageLayout &
  (
    | { contentSource: "published" }
    | { contentSource: "curated"; sections: InformationSection[] }
  );

const pageDefinitions: InformationPageConfiguration[] = [
  {
    slug: "sviatosti/sviatost-krstu",
    title: "Sviatosť krstu",
    eyebrow: "Sviatosti",
    introduction:
      "Začiatok života vo viere. Krstom sa stávame Božími deťmi a súčasťou spoločenstva Cirkvi.",
    kind: "sacrament",
    contentSource: "published",
    links: [
      {
        label: "Žiadosť o krst dieťaťa · PDF",
        href: "https://drive.google.com/file/d/1FLVZcfDZFi0Fcp9qAX-_5CduaBbMbRO6/view?usp=sharing"
      }
    ]
  },
  {
    slug: "sviatosti/sviatost-eucharistie",
    title: "Sviatosť Eucharistie",
    eyebrow: "Sviatosti",
    kind: "sacrament",
    introduction:
      "Eucharistia je prameň a vrchol kresťanského života. V jej slávení sa stretávame s Kristom a tvoríme jedno spoločenstvo.",
    contentSource: "published"
  },
  {
    slug: "sviatosti/sviatost-birmovania",
    title: "Sviatosť birmovania",
    eyebrow: "Sviatosti",
    kind: "sacrament",
    introduction:
      "Dar Ducha Svätého nás posilňuje vo viere, prehlbuje naše spojenie s Cirkvou a pozýva vydávať svedectvo o Kristovi.",
    contentSource: "published"
  },
  {
    slug: "sviatosti/sviatost-manzelstva",
    title: "Sviatosť manželstva",
    eyebrow: "Sviatosti",
    kind: "sacrament",
    introduction:
      "Spoločná cesta lásky a vernosti. Sviatosť manželstva posilňuje jednotu manželov a sprevádza ich v každodennom živote.",
    contentSource: "published"
  },
  {
    slug: "sviatosti/sviatost-zmierenia",
    title: "Sviatosť zmierenia",
    eyebrow: "Sviatosti",
    kind: "sacrament",
    introduction:
      "Priestor na nový začiatok. V sviatosti zmierenia prijímame Božie odpustenie a obnovujeme spoločenstvo s Bohom i s Cirkvou.",
    contentSource: "published",
    links: [{ label: "Pozrieť farské oznamy", href: "/farnost/farske-oznamy" }]
  },
  {
    slug: "sviatosti/sviatost-pomazania-chorych",
    title: "Pomazanie chorých",
    eyebrow: "Sviatosti",
    kind: "sacrament",
    introduction:
      "Blízkosť, nádej a posila v chorobe. Cirkev sprevádza chorých modlitbou a sviatostnou službou.",
    contentSource: "published"
  },
  {
    slug: "farnost/kostol-sv-alzbety",
    title: "Kostol sv. Alžbety",
    eyebrow: "Naše kostoly",
    kind: "church",
    introduction:
      "Srdce farnosti na zvolenskom námestí. Miesto modlitby, stretnutí a príbehov, ktoré spájajú generácie.",
    contentSource: "published",
    timeline: [
      {
        year: "13. storočie",
        title: "Stredoveké korene",
        text: "História farského kostola siaha do stredoveku a je úzko spojená s dejinami mesta Zvolen."
      },
      {
        year: "1673",
        title: "Mariánska kaplnka",
        text: "Farská história spája vznik bočnej kaplnky s návratom kostola katolíkom."
      },
      {
        year: "Dnes",
        title: "Živé spoločenstvo",
        text: "Farský kostol zostáva miestom slávenia Eucharistie, prijímania sviatostí a spoločnej modlitby."
      }
    ],
    credit: "Spracované podľa farskej histórie od Jozefa Kanianskeho.",
    links: [
      { label: "Galéria kostola", href: "/farnost/galeria" },
      { label: "Rozpis bohoslužieb", href: "/farnost/farske-oznamy" }
    ]
  },
  {
    slug: "farnost/kostol-sv-jana-pavla-v-lieskovci",
    title: "Kostol sv. Jána Pavla II.",
    eyebrow: "Filiálka Lieskovec",
    kind: "church",
    introduction:
      "Miesto modlitby a stretnutia v Lieskovci, zasvätené svätému Jánovi Pavlovi II., apoštolovi Božieho milosrdenstva.",
    contentSource: "published",
    timeline: [
      {
        year: "1998",
        title: "Prvá svätá omša",
        text: "Začiatok pravidelného liturgického života v obci."
      },
      {
        year: "2009",
        title: "Začiatok stavby",
        text: "Nový kostol začali stavať 30. apríla 2009."
      },
      {
        year: "2011",
        title: "Konsekrácia",
        text: "Kostol 19. novembra konsekroval biskup Mons. Tomáš Galis."
      }
    ],
    credit: "Spracované podľa farskej histórie od Jozefa Kanianskeho.",
    links: [{ label: "Rozpis bohoslužieb", href: "/farnost/farske-oznamy" }]
  },
  {
    slug: "farnost/kostol-sv-matusa-v-zolnej",
    title: "Kostol sv. Matúša v Zolnej",
    eyebrow: "Filiálka Zolná",
    kind: "church",
    introduction:
      "Malý ranogotický kostol na návrší uprostred obce. Vzácna pamiatka, ktorá uchováva stáročia viery a umenia.",
    contentSource: "published",
    timeline: [
      {
        year: "13. storočie",
        title: "Vznik kostola",
        text: "Ranogotická stavba nesie aj prvky doznievajúceho románskeho slohu."
      },
      {
        year: "14. storočie",
        title: "Nástenné maľby",
        text: "Interiér postupne získava výnimočnú maliarsku výzdobu."
      },
      {
        year: "2011 – 2017",
        title: "Obnova",
        text: "Komplexná rekonštrukcia pomohla obnoviť historickú podobu kostola."
      }
    ],
    credit: "Spracované podľa farského textu od Jozefa Kanianskeho.",
    links: [{ label: "Rozpis bohoslužieb", href: "/farnost/farske-oznamy" }]
  },
  {
    slug: "spolocenstva/detsky-spevokol",
    title: "Detský spevokol Alžbetka",
    eyebrow: "Spoločenstvá",
    kind: "community",
    introduction:
      "Spievame, hráme a rastieme spolu. Detský spevokol je miestom pre deti, ktoré chcú prinášať radosť do spoločného slávenia.",
    contentSource: "published",
    facts: [
      { label: "Kde sa stretávame", value: "Farský klub" },
      { label: "Služba", value: "Detské sväté omše" }
    ]
  },
  {
    slug: "spolocenstva/mladeznicky-zbor",
    title: "Mládežnícky zbor Alžbeta",
    eyebrow: "Spoločenstvá",
    kind: "community",
    introduction:
      "Spoločenstvo mladých ľudí, ktorých spája viera a hudba. Každý talent môže priniesť niečo nové.",
    contentSource: "published",
    facts: [
      { label: "Kde sa stretávame", value: "Farský klub" },
      { label: "Služba", value: "Mládežnícke sväté omše" }
    ]
  },
  {
    slug: "spolocenstva/ministranti",
    title: "Miništranti Zvolen-mesto",
    eyebrow: "Spoločenstvá",
    kind: "community",
    introduction:
      "Služba pri oltári, priateľstvá aj spoločné zážitky. Radi medzi nami privítame každého nového miništranta.",
    contentSource: "published",
    facts: [
      { label: "Prvý krok", value: "Príďte do sakristie" },
      { label: "Služba", value: "Pri slávení liturgie" }
    ]
  },
  {
    slug: "spolocenstva/reholne-sestry",
    title: "Rehoľné sestry",
    eyebrow: "Spoločenstvá",
    kind: "community",
    introduction:
      "Kongregácia Dcér sv. Františka Assiského. Zasvätený život, modlitba a služba potrebám farnosti.",
    contentSource: "published",
    facts: [
      { label: "Kongregácia", value: "Dcéry sv. Františka Assiského" },
      { label: "Spiritualita", value: "Františkánska" }
    ]
  },
  {
    slug: "spolocenstva/akolyti",
    title: "Akolyti",
    eyebrow: "Služba vo farnosti",
    kind: "community",
    introduction:
      "Služba pri oltári a blízkosť tým, ktorí sa pre chorobu či vek nemôžu zúčastniť na svätej omši.",
    contentSource: "curated",
    sections: [
      {
        title: "Pri oltári aj pri chorých",
        paragraphs: [
          "Akolyti pomáhajú kňazovi a diakonovi pri slávení liturgie, najmä pri príprave oltára a liturgických nádob. V prípade potreby pomáhajú aj pri rozdávaní svätého prijímania.",
          "Na základe príslušného poverenia môžu prinášať Eucharistiu chorým a nevládnym. Táto tichá služba spája ľudí, ktorí zostávajú doma alebo v nemocnici, so životom farského spoločenstva."
        ]
      },
      {
        title: "Záujem o túto službu",
        paragraphs: [
          "Služba akolytu si vyžaduje duchovnú aj praktickú prípravu a príslušné ustanovenie alebo poverenie Cirkvi. Ak ťa táto služba oslovuje, porozprávaj sa s kňazom alebo sa obráť na farskú kanceláriu."
        ]
      }
    ]
  },
  {
    slug: "spolocenstva/lektori",
    title: "Lektori",
    eyebrow: "Služba vo farnosti",
    kind: "community",
    introduction:
      "Svojím hlasom pomáhame Božiemu slovu zaznieť tak, aby mu celé spoločenstvo mohlo pozorne načúvať.",
    contentSource: "curated",
    sections: [
      {
        title: "Služba Božieho slova",
        paragraphs: [
          "Lektori pri svätej omši prednášajú biblické čítania okrem evanjelia. Podľa potreby čítajú aj úmysly spoločných modlitieb veriacich. Svojou službou pomáhajú celému spoločenstvu počúvať a prijímať Božie slovo.",
          "K tejto službe patrí príprava: prečítať si text vopred, porozumieť mu a predniesť ho pokojne a zrozumiteľne. Dôležitá je ochota slúžiť, úcta k Svätému písmu a pripravenosť učiť sa."
        ]
      },
      {
        title: "Chceš sa zapojiť?",
        paragraphs: [
          "Ak ťa oslovuje služba čítania pri bohoslužbách, ozvi sa vo farskej kancelárii alebo oslov kňaza po svätej omši. Dohodneš sa na potrebnej príprave a možnostiach zapojenia."
        ]
      }
    ]
  },
  {
    slug: "spolocenstva/ruzencove-bratstvo",
    title: "Ružencové bratstvo",
    eyebrow: "Spoločenstvá",
    kind: "community",
    introduction: "Obsah pripravujeme.",
    contentSource: "published"
  },
  {
    slug: "farnost/cirkevna-skola",
    title: "Základná škola sv. Dominika Savia",
    eyebrow: "Cirkevná škola",
    kind: "school",
    introduction:
      "Vzdelávanie, výchova a kresťanské hodnoty. Škola rodinného typu, ktorá patrí do života našej farnosti.",
    contentSource: "published",
    facts: [
      { label: "Vznik školy", value: "1. júl 1992" },
      { label: "Školský klub", value: "Svetielko" }
    ],
    links: [
      { label: "Navštíviť stránku školy", href: "https://zsdomzv.edupage.org/" }
    ]
  },
  {
    slug: "kontakt",
    title: "Sme tu pre vás",
    eyebrow: "Kontakt",
    kind: "contact",
    introduction:
      "Potrebujete dohodnúť sviatosť, vybaviť doklad alebo sa s niečím poradiť? Ozvite sa nám alebo nás navštívte vo farskej kancelárii.",
    contentSource: "published"
  },
  {
    slug: "farnost/galeria",
    title: "Krása nášho kostola",
    eyebrow: "Galéria kostola",
    kind: "gallery",
    introduction:
      "Zastavte sa pri architektúre, svetle a detailoch Kostola sv. Alžbety. Fotografie odhaľujú miesta, ktoré pri bežnej návšteve ľahko prehliadneme.",
    contentSource: "published",
    links: [
      { label: "O Kostole sv. Alžbety", href: "/farnost/kostol-sv-alzbety" },
      {
        label: "Virtuálna prehliadka a 3D modely",
        href: "/farnost/virtualna-prehliadka"
      }
    ]
  },
  {
    slug: "objav-krista",
    title: "Objav Krista",
    eyebrow: "Pozvanie",
    kind: "resource",
    introduction:
      "Priestor pre váš ďalší krok. Prihlasovací formulár nájdete v odkaze nižšie.",
    contentSource: "curated",
    sections: [
      {
        title: "Prihlásenie a informácie",
        paragraphs: [
          "Formulár sa otvorí na stránke Google Forms. Aktuálnosť ponuky a otázky o príprave si môžete overiť vo farskej kancelárii."
        ]
      }
    ],
    links: [
      {
        label: "Otvoriť formulár",
        href: "https://docs.google.com/forms/d/e/1FAIpQLSdLHclCQkOjBSldcKlFdaEf6FC4rNLKEnROGPWCnPMUMrd_Cw/viewform"
      }
    ]
  },
  {
    slug: "den-farskej-rodiny",
    title: "Deň farskej rodiny",
    eyebrow: "Život farnosti",
    kind: "resource",
    introduction:
      "Spoločenstvo sa tvorí aj pri obyčajnom stretnutí. Informácie o najbližšom podujatí sledujte vo farských oznamoch.",
    contentSource: "published",
    links: [{ label: "Aktuálne farské oznamy", href: "/farnost/farske-oznamy" }]
  },
  {
    slug: "farnost/kalendar-akcii",
    title: "Kalendár akcií",
    eyebrow: "Život farnosti",
    kind: "resource",
    introduction:
      "Najbližšie stretnutia, slávnosti a podujatia nájdete v aktuálnych farských oznamoch a na výveske.",
    contentSource: "published",
    links: [
      { label: "Farské oznamy", href: "/farnost/farske-oznamy" },
      { label: "Výveska", href: "/#vyveska" }
    ]
  },
  {
    slug: "farnost/virtualna-prehliadka",
    title: "Objavte kostol zblízka",
    eyebrow: "Virtuálna prehliadka",
    kind: "tour",
    introduction:
      "Architektúra a umenie našich kostolov aj z iného pohľadu. Pozrite si fotografie a 3D modely.",
    contentSource: "published",
    models: [
      {
        id: "ba87a3588d624facabb1bb8ef27a786e",
        title: "Kaplnka"
      },
      {
        id: "e182d079f96641f49d876abdd4735f3d",
        title: "Oltár v Kostole sv. Alžbety vo Zvolene"
      }
    ],
    links: [{ label: "Otvoriť galériu", href: "/farnost/galeria" }]
  }
];

/** Missing approved source is an error, never permission to use abridged copy. */
export function requirePublishedInformationContent(route: string) {
  const source = publishedInformationContent.find(
    (page) => page.route === route
  );
  if (!source)
    throw new Error(`Missing published information content: ${route}`);
  return source;
}

export const informationPages: InformationPageDefinition[] =
  pageDefinitions.map((page) => {
    if (page.contentSource === "curated") return page;
    return {
      ...page,
      source: requirePublishedInformationContent(`/${page.slug}`)
    };
  });

export function findInformationPage(slug: string) {
  return informationPages.find((page) => page.slug === slug);
}
