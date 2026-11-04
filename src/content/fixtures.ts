/**
 * Public demonstration content for the explicit CONTENT_SOURCE=fixtures adapter.
 * Editorial bodies are representative excerpts, not the production migration.
 * Production settings must never use these defaults. Permanent photographs live
 * in assets.ts. Keep unpublished content and private records out of this module.
 */
import type {
  Bulletin,
  CalendarDate,
  EditorialEntry,
  Poster,
  RegularSchedule,
  SiteSettings
} from "@/content/types";
import { addDays, getMonday } from "@/lib/calendar";

export const siteSettings: SiteSettings = {
  name: "Rímskokatolícka farnosť Zvolen–mesto",
  shortName: "Farnosť Zvolen–mesto",
  location: "Kostol sv. Alžbety",
  phone: "0911 588 977",
  email: "fara.zv.mesto@gmail.com",
  address: "Námestie SNP 68/40, 960 01 Zvolen",
  iban: "SK72 1111 0000 0066 1528 6006",
  officeHours: [
    {
      day: "Pondelok",
      time: "8:30 – 10:30"
    },
    {
      day: "Streda",
      time: "8:30 – 10:30 a 14:00 – 16:30"
    },
    {
      day: "Piatok",
      time: "8:30 – 10:30"
    }
  ],
  preparationMeetings: [
    {
      name: "Sobášna",
      time: "Pondelok o 19:00"
    },
    {
      name: "Krstná",
      time: "Štvrtok o 19:00"
    }
  ],
  preparationNote: "Je potrebné sa vopred nahlásiť."
};

export const posters: Poster[] = [
  {
    id: "poster-posts-165",
    title: "Môj syn, František",
    image: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1791663120/Moj_syn_Frantisek_Hodova_slavnost_9cc6c9ac1e.webp",
      width: 1055,
      height: 1491,
      alt: "Môj syn, František"
    },
    date: "2026-10-20",
    href: "/prispevky/moj-syn-frantisek"
  },
  {
    id: "poster-posts-166",
    title: "Keď sa modlí matka: Biblická cesta od Hagar k Márii",
    image: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1793291296/Ked_sa_modli_matka_f8e3ff62ff.webp",
      width: 3508,
      height: 4961,
      alt: "Keď sa modlí matka: Biblická cesta od Hagar k Márii"
    },
    date: "2026-10-29",
    href: "/prispevky/ked-sa-modli-matka-biblicka-cesta-od-hagar-k-marii"
  },
  {
    id: "poster-posts-163",
    title: "Opevnenie kostola sv. Matúša - Zolná",
    image: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1789017507/BBSK_plagat_Zolna_2026_page_0001_57f4df91ae.jpg",
      width: 1241,
      height: 1755,
      alt: "Opevnenie kostola sv. Matúša - Zolná"
    },
    date: "2026-09-10",
    href: "/prispevky/opevnenie-kostola-sv-matusa-zolna-1"
  },
  {
    id: "poster-posts-131",
    title: "Sviatosť pomazania chorých - Nemocnica Zvolen",
    image: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1789807686/rozpis_spovedania_v_nemocnici_6753655666.jpg",
      width: 1536,
      height: 1085,
      alt: "Sviatosť pomazania chorých - Nemocnica Zvolen"
    },
    date: "2025-06-23",
    href: "/prispevky/sluzba-pomazania-chorych-nemocnica-zvolen"
  }
];

export const news: EditorialEntry[] = [
  {
    id: "posts-166",
    slug: "ked-sa-modli-matka-biblicka-cesta-od-hagar-k-marii",
    title: "Keď sa modlí matka: Biblická cesta od Hagar k Márii",
    excerpt:
      "Cleopas, o. z., v spolupráci s Rímskokatolíckou cyrilometodskou bohosloveckou fakultou Univerzity Komenského v Bratislave (RKCMBF UK), vás pozývajú na adventný víkend s Bibliou s názvom Keď sa modlí matka: Biblická cesta od Hagar…",
    date: "2026-10-29",
    blocks: [
      {
        type: "paragraph",
        text: "Cleopas, o. z., v spolupráci s Rímskokatolíckou cyrilometodskou bohosloveckou fakultou Univerzity Komenského v Bratislave (RKCMBF UK), vás pozývajú na adventný víkend s Bibliou s názvom Keď sa modlí matka: Biblická cesta od Hagar k Márii, ktorý sa bude konať v dňoch 27. – 29. novembra 2026 v Dome Xaver v Badíne (https://www.xaver.sk/)."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1793291296/Ked_sa_modli_matka_f8e3ff62ff.webp",
      width: 3508,
      height: 4961,
      alt: "Keď sa modlí matka: Biblická cesta od Hagar k Márii"
    }
  },
  {
    id: "posts-165",
    slug: "moj-syn-frantisek",
    title: "Môj syn, František",
    excerpt:
      "Srdečne vás pozývame na hodovú slávnosť Farnosti Zvolen-mesto 22. novembra 2026. Pripravený je deviatnik s benediktínmi zo Sampora, celonočná adorácia, slávnostná svätá omša, premiéra divadla Môj syn, František a spoločné agapé",
    date: "2026-10-20",
    blocks: [
      {
        type: "paragraph",
        text: "Srdečne vás pozývame na hodovú slávnosť Farnosti Zvolen-mesto 22. novembra 2026. Pripravený je deviatnik s benediktínmi zo Sampora, celonočná adorácia, slávnostná svätá omša, premiéra divadla Môj syn, František a spoločné agapé"
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1791663120/Moj_syn_Frantisek_Hodova_slavnost_9cc6c9ac1e.webp",
      width: 1055,
      height: 1491,
      alt: "Môj syn, František"
    }
  },
  {
    id: "posts-80",
    slug: "poboznost-ku-cti-sv-sarbela",
    title: "Pobožnosť ku cti sv. Šarbela v štvrtok 22. októbra",
    excerpt:
      "Pobožnosť ku cti sv. Šarbela bude v štvrtok 22. októbra (štvrtok) a aj potom každého 22. v mesiaci po celý rok 2026 v Kostole sv. Alžbety vo Zvolene po večernej sv. omši (o 18:00 hod.) Pobožnosť bude spojená s pomazaním olejom a…",
    date: "2026-10-08",
    blocks: [
      {
        type: "paragraph",
        text: "Pobožnosť ku cti sv. Šarbela bude v štvrtok 22. októbra (štvrtok) a aj potom každého 22. v mesiaci po celý rok 2026 v Kostole sv. Alžbety vo Zvolene po večernej sv. omši (o 18:00 hod.) Pobožnosť bude spojená s pomazaním olejom a prosbami za uzdravenie. Svoje krátke modlitbové úmysly za uzdravenie môžete napísať aj prostredníctvom online formuláru."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1769784540/sveti_charbel_e1723224202160_01981a6793.png",
      width: 691,
      height: 691,
      alt: "Pobožnosť ku cti sv. Šarbela v štvrtok 22. októbra"
    }
  },
  {
    id: "posts-163",
    slug: "opevnenie-kostola-sv-matusa-zolna-1",
    title: "Opevnenie kostola sv. Matúša - Zolná",
    excerpt:
      "Obnova opevnenia kostola sv. Matúša v Zolnej pokračuje! Vďaka podpore Banskobystrického samosprávneho kraja sme zrealizovali sanáciu muriva a obnovu krovu. Ďakujeme za zachovanie kultúrneho dedičstva!",
    date: "2026-09-10",
    blocks: [
      {
        type: "paragraph",
        text: "Obnova opevnenia kostola sv. Matúša v Zolnej pokračuje! Vďaka podpore Banskobystrického samosprávneho kraja sme zrealizovali sanáciu muriva a obnovu krovu. Ďakujeme za zachovanie kultúrneho dedičstva!"
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1789017507/BBSK_plagat_Zolna_2026_page_0001_57f4df91ae.jpg",
      width: 1241,
      height: 1755,
      alt: "Opevnenie kostola sv. Matúša - Zolná"
    }
  },
  {
    id: "posts-131",
    slug: "sluzba-pomazania-chorych-nemocnica-zvolen",
    title: "Sviatosť pomazania chorých - Nemocnica Zvolen",
    excerpt:
      "Sviatosť pomazania chorých prináša posilu, úľavu a nádej pacientom v ťažkých chvíľach choroby. Duchovná starostlivosť, ktorá prináša pokoj a Božiu blízkosť.",
    date: "2025-06-23",
    blocks: [
      {
        type: "paragraph",
        text: "Sviatosť pomazania chorých prináša posilu, úľavu a nádej pacientom v ťažkých chvíľach choroby. Duchovná starostlivosť, ktorá prináša pokoj a Božiu blízkosť."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1789807686/rozpis_spovedania_v_nemocnici_6753655666.jpg",
      width: 1536,
      height: 1085,
      alt: "Sviatosť pomazania chorých - Nemocnica Zvolen"
    }
  },
  {
    id: "posts-100",
    slug: "pomozme-spolu-zrestaurovat-oltar-1",
    title: "POMÔŽME SPOLU ZREŠTAUROVAŤ OLTÁRE",
    excerpt:
      "Drahí bratia, sestry a všetci dobrodinci, touto cestou Vám chcem vyjadriť svoju vďačnosť za Vašu pomoc. Vaša štedrosť je pre celé naše farské spoločenstvo prejavom Božej dobroty, lebo Vaše milodary sú nádejou, že sa nám podarí…",
    date: "2024-01-30",
    blocks: [
      {
        type: "paragraph",
        text: "Drahí bratia, sestry a všetci dobrodinci, touto cestou Vám chcem vyjadriť svoju vďačnosť za Vašu pomoc. Vaša štedrosť je pre celé naše farské spoločenstvo prejavom Božej dobroty, lebo Vaše milodary sú nádejou, že sa nám podarí zreštaurovať aj posledný z trojice oltárov, oltár sv. Jozefa. Všetky tri oltáre sú jedinečným skvostom nášho farského kostola."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1726829378/Snimka_obrazovky_2024_09_20_o_12_49_12_7ac046676b.png",
      width: 780,
      height: 1714,
      alt: "POMÔŽME SPOLU ZREŠTAUROVAŤ OLTÁRE"
    }
  }
];

export const articles: EditorialEntry[] = [
  {
    id: "articles-153",
    slug: "archiv-nase-spolocenstvo",
    title: "Archív Naše Spoločenstvo",
    excerpt: "Sprístupňujeme vám archív časopisu Naše spoločenstvo.",
    date: "2026-01-17",
    blocks: [
      {
        type: "paragraph",
        text: "Sprístupňujeme vám archív časopisu Naše spoločenstvo."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1766130114/pexels_cottonbro_6333743_69e895b8f3.jpg",
      width: 6494,
      height: 4329,
      alt: "Archív Naše Spoločenstvo"
    }
  },
  {
    id: "articles-152",
    slug: "kolegium-antona-neuwirtha",
    title: "Kolégium Antona Neuwirtha",
    excerpt:
      "Inšpirované odkazom Antona Neuwirtha, kolégium prináša klasické vzdelanie v duchu kresťanských hodnôt a kultúrneho dedičstva západnej civilizácie. Spoznajte, ako jeho odkaz žije v mladých študentoch aj 20 rokov po jeho odchode.",
    date: "2024-11-02",
    blocks: [
      {
        type: "paragraph",
        text: "Inšpirované odkazom Antona Neuwirtha, kolégium prináša klasické vzdelanie v duchu kresťanských hodnôt a kultúrneho dedičstva západnej civilizácie. Spoznajte, ako jeho odkaz žije v mladých študentoch aj 20 rokov po jeho odchode."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1730555351/349198684_1005993037234147_3480454416959137432_n_e3c5aa90e1.jpg",
      width: 2048,
      height: 1365,
      alt: "Kolégium Antona Neuwirtha"
    }
  },
  {
    id: "articles-151",
    slug: "novy-farsky-vikar",
    title: "Nový farský vikár",
    excerpt:
      "Milí čitatelia časopisu Naše spoločenstvo, všetkých vás srdečne pozdravujem. Som veľmi rád, že po roku môžem opäť do tohto časopisu napísať už nie ako diakon, ale ako zvolenský kaplán, čo ma napĺňa veľkou radosťou, pretože…",
    date: "2024-10-09",
    blocks: [
      {
        type: "paragraph",
        text: "Milí čitatelia časopisu Naše spoločenstvo, všetkých vás srdečne pozdravujem. Som veľmi rád, že po roku môžem opäť do tohto časopisu napísať už nie ako diakon, ale ako zvolenský kaplán, čo ma napĺňa veľkou radosťou, pretože zvolenská farnosť sa mi za rok diakonskej služby stala druhým domov. Nie darmo sa zvykne hovoriť o prvom pôsobisku ako o „prvej pastoračnej láske“ – a v tomto prípade to platí dvojnásobne, prvýkrát ako diakon a teraz ako váš kaplán. Od redaktorky mesta som dostal pár otázok, na ktoré rád odpovedám."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1638552241/IMG_3760_f6f2e44c99.jpg",
      width: 1024,
      height: 851,
      alt: "Nový farský vikár"
    }
  },
  {
    id: "articles-150",
    slug: "bohoslovci-vo-zvolene",
    title: "Bohoslovci vo Zvolene",
    excerpt:
      "Pri príležitosti Nedele Dobrého Pastiera našu farnosť dňa 21. 4. 2024 navštívili bohoslovci banskobystrickej diecézy. Z Nitry pricestovali jedenásti seminaristi aj so svojím špirituálom d. p. Petrom Jandurom. Doobeda pri sv.…",
    date: "2024-10-09",
    blocks: [
      {
        type: "paragraph",
        text: "Pri príležitosti Nedele Dobrého Pastiera našu farnosť dňa 21. 4. 2024 navštívili bohoslovci banskobystrickej diecézy. Z Nitry pricestovali jedenásti seminaristi aj so svojím špirituálom d. p. Petrom Jandurom. Doobeda pri sv. omšiach v meste a v Lieskovci veriacich povzbudili svojimi úvahami. Popoludní sa stretli s veriacimi v Kostole"
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1728459176/IMG_3020_b647abced4.jpg",
      width: 6000,
      height: 4000,
      alt: "Bohoslovci vo Zvolene"
    }
  },
  {
    id: "articles-149",
    slug: "nova-farska-rada",
    title: "Nová farská rada",
    excerpt:
      "Na sviatok Najsvätejšieho Tela a Krvi po večernej svätej omši sa po prvýkrát stretli členovia novej farskej pastoračnej rady. Členovia sú rozdelení do menších skupín. Farskú radu začal farár farnosti Zvolen-mesto, Mgr. Jozef…",
    date: "2024-10-09",
    blocks: [
      {
        type: "paragraph",
        text: "Na sviatok Najsvätejšieho Tela a Krvi po večernej svätej omši sa po prvýkrát stretli členovia novej farskej pastoračnej rady. Členovia sú rozdelení do menších skupín."
      },
      {
        type: "paragraph",
        text: "Farskú radu začal farár farnosti Zvolen-mesto, Mgr. Jozef Kraus. Privítal nových členov a poďakoval im za ochotou pracovať aj touto službou pre farnosť. Následne členovia zložili sľub. Ich voľba je na 5 rokov."
      },
      {
        type: "paragraph",
        text: "Rozdelenie pastoračnej rady, je nasledovné: Hlavou farskej pastoračnej rady je: Jozef Kraus – dekan, Matin Lenhardt – farský vikár I. Organizačno-hospodárska sekcia: Marek Turanský, Eduard Bublinec st., Mária Sekerešová II. Charitatívna sekcia: Miroslava Bublincová st. – charita, Marek Kunštár, Jana Kunštárová"
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1728458352/pexels_grizzlybear_965878_7c00e9e8fe.jpg",
      width: 3008,
      height: 2000,
      alt: "Nová farská rada"
    }
  },
  {
    id: "articles-148",
    slug: "oltariky",
    title: "OLTÁRIKY",
    excerpt:
      "Sviatok Najsvätejšieho Kristovho Tela a Krvi bol presunutý zo štvrtku 30. mája na nedeľu 2. júna. Sv. omša sa slávila v Parku Ľudovíta Štúra. K tejto slávnosti už tradične patrí aj príprava oltárikov. Každá farnosť mala jeden.…",
    date: "2024-10-09",
    blocks: [
      {
        type: "paragraph",
        text: "Sviatok Najsvätejšieho Kristovho Tela a Krvi bol presunutý zo štvrtku 30. mája na nedeľu 2. júna. Sv. omša sa slávila v Parku Ľudovíta Štúra. K tejto slávnosti už tradične patrí aj príprava oltárikov. Každá farnosť mala jeden. (Zv-mesto, Zv-Sekier, Zv-Západ a filiálka Zv-Lieskovec)"
      },
      {
        type: "paragraph",
        text: "Dekan farnosti Zvolen-mesto privítal medzi nami vzácneho hosťa, otca Daniela Petra Janáčeka, ktorý je opátom Strahovského kláštora v Prahe. Prišiel k nám, aby s nami v tomto krásnom prírodnom prostredí oslávil sviatok Božieho Tela a Krvi. Zišli sme sa, aby sme aj my verejne vyznali svoju vieru v Ježiša Krista."
      },
      {
        type: "paragraph",
        text: "Otec Daniel poďakoval za milé pozvanie a prejavil radosť nad tým, že tu môže medzi nami, Zvolenčanmi, byť. Ako povedal, vo Zvolene je prvýkrát. Všetkých nás možno prekvapilo, že rozprával po slovensky. No otec Daniel to hneď aj vysvetlil – pochádza z Považia a jeho materčina je vlastne „dzedzinština“ a slovenčinu sa učil až v škole."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1728458004/omsa_2_f871dc5383.jpg",
      width: 3936,
      height: 2624,
      alt: "OLTÁRIKY"
    }
  },
  {
    id: "articles-147",
    slug: "restauratori-objavili-doteraz-nepoznany-obraz",
    title: "Reštaurátori objavili doteraz nepoznaný „obraz“",
    excerpt:
      "V Kaplnke Sedembolestnej Panny Márie pri farskom kostole prebieha I. etapa reštaurovania oltárnej architektúry, svätostánku (tabernacula) a ornamentálnej výzdoby hlavného barokového oltára Piety. Tento historický sakrálny…",
    date: "2024-10-09",
    blocks: [
      {
        type: "paragraph",
        text: "V Kaplnke Sedembolestnej Panny Márie pri farskom kostole prebieha I. etapa reštaurovania oltárnej architektúry, svätostánku (tabernacula) a ornamentálnej výzdoby hlavného barokového oltára Piety. Tento historický sakrálny mobiliár pochádza z roku 1744. Prvá etapa reštaurátorskej realizácie by mala trvať päť mesiacov. S prácami začal reštaurátorský tím pod vedením reštaurátora akad. sochára Árpáda Mézesa zo Želiezoviec po Veľkonočných sviatkoch. V tíme spolupracujú Mgr. art. Július Karcol, Dušan Tariška a Adriana Tarišková."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1728457598/Untitled_3_6b6e34a386.png",
      width: 472,
      height: 354,
      alt: "Reštaurátori objavili doteraz nepoznaný „obraz“"
    }
  },
  {
    id: "articles-146",
    slug: "oprava-organa",
    title: "Oprava organa",
    excerpt:
      "Farnosť pristúpila ku postupnej generálnej oprave organa V máji 2024 začala oprava takmer storočného píšťalového organa vo Farskom kostole sv. Alžbety. Nástroj vyrobila v roku 1928 renomovaná česká firma Rieger – Kloss Varhany z…",
    date: "2024-10-08",
    blocks: [
      {
        type: "paragraph",
        text: "Farnosť pristúpila ku postupnej generálnej oprave organa"
      },
      {
        type: "paragraph",
        text: "V máji 2024 začala oprava takmer storočného píšťalového organa vo Farskom kostole sv. Alžbety. Nástroj vyrobila v roku 1928 renomovaná česká firma Rieger – Kloss Varhany z Krnova. Organ vo farskom kostole sa hrdí tromi desiatkami registrov, má dve manuálové a jednu pedálovú klaviatúru, pneumatický tlakový systém, približne dve tisícky jazykových aj labiálnych píšťal."
      },
      {
        type: "paragraph",
        text: "Aktuálne prebehla prvá etapa generálnej opravy, a to renovácia prvkov hracieho stola. Teda tej časti, odkiaľ organista ovláda klaviatúry, registre a pedálnicu. Toto predstavuje 30% z celkových plánovaných prác."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1728373244/Untitled_2_b323ba90b7.png",
      width: 472,
      height: 354,
      alt: "Oprava organa"
    }
  },
  {
    id: "articles-145",
    slug: "pan-kaplan-jozef",
    title: "Pán kaplán Jozef",
    excerpt:
      "Po roku pôsobenia v našej farnosti, sme položili nášmu pánovi kaplánovi Jozefovi Benčatovi pár otázok. Čo sa Vám najviac páčilo a čo sa Vám, naopak, nepáčilo v našej farnosti? Ďakujem všetkým za prijatie tu vo Zvolene. Je to tu…",
    date: "2024-10-08",
    blocks: [
      {
        type: "paragraph",
        text: "Po roku pôsobenia v našej farnosti, sme položili nášmu pánovi kaplánovi Jozefovi Benčatovi pár otázok."
      },
      {
        type: "paragraph",
        text: "Čo sa Vám najviac páčilo a čo sa Vám, naopak, nepáčilo v našej farnosti? Ďakujem všetkým za prijatie tu vo Zvolene. Je to tu naozaj pestrá farnosť Zvolen – mesto. Je veľmi dobre, že je tu veľa ľudí, ktorí pomáhajú vo farnosti a ktorí sa zapájajú do rôznych aj duchovných akcií. Osobitné poďakovanie patrí pánu dekanovi Jozefovi Krausovi, ktorý ma viedol, ale aj za kamarátstvo s Martinom Lenhardtom. Ďakujem za pomoc pani kostolníčke, organistom, spevokolom, katechétkam, mnohým miništrantom, lektorom a tiež akolytom, mimoriadnym rozdávateľom svätého prijímania, ktorý mi pomáhali pri svätých omšiach a tiež v nemocnici. Toto je v máloktorých farnostiach takto pekne rozbehnutá služba mimoriadnych rozdávateľov. Obrovská vďaka patrí našej kuchárke na fare, jej manželovi, aj mnohým ďalším ľuďom, ktorých služba je pre mnohých skrytá, napríklad tým ktorí upratujú v kostole. Ďakujem aj za modlitby. Ďakujem za pekné spoločenstvo aj na filiálke v Lieskovci alebo kostol v Zolnej. Obrovským benefitom Zvolena je aj cirkevná Základná škola sv. Dominika Savia – ináč je to aj môj patrón v nebi, ktorý za krátky život dosiahol to najdôležitejšie – nebo. V tejto škole deti, v ktorej dobrý kolektív ich vedie k Pánu, Bohu, majú možnosti svätej spovede, svätej omše a mnohých iných duchovných aktivít. Taktiež dávam do pozornosti aj Charitu sv. Alžbety. Na prvom mieste vo farnosti je duchovný a liturgický život: sväté spovede, sväté omše a vysluhovanie ďalších sviatostí, adorácie ako aj ľudová zbožnosť. Potom veľmi dobré boli aj rôzne duchovné aktivity vo farnosti, tábory, stretká, duchovné obnovy, farské divadlo, koncerty, spoločenstvá, pobožnosti krížovej cesty, púte. Ďakujem za všetko dobré a prosím o odpustenie za moje chyby a nedokonalosti."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1728372686/pan_kaplan_Jozef_d76aabb231.jpg",
      width: 6000,
      height: 8000,
      alt: "Pán kaplán Jozef"
    }
  },
  {
    id: "articles-144",
    slug: "veza-opeknela",
    title: "Veža opeknela",
    excerpt:
      "Väčšina veriacich našej farnosti pozná svoj Kostol sv. Alžbety naozaj dôverne. Renesančnú hlavnú loď, gotické presbytérium, Kaplnku Sedembolestnej Panny Márie. Mnohí už stáli na chóre vedľa majestátneho organu alebo poznajú aj…",
    date: "2024-10-08",
    blocks: [
      {
        type: "paragraph",
        text: "Väčšina veriacich našej farnosti pozná svoj Kostol sv. Alžbety naozaj dôverne. Renesančnú hlavnú loď, gotické presbytérium, Kaplnku Sedembolestnej Panny Márie. Mnohí už stáli na chóre vedľa majestátneho organu alebo poznajú aj jeho zákulisie – sakristiu s krížovou klenbou. No len málokto pozná vnútro veže kostola, ktorá mu dáva naďaleko jedinečný vzhľad."
      },
      {
        type: "paragraph",
        text: "Interiér veže sa za posledné roky zmenil na nepoznanie. Boli zrekonštruované kamenné a aj drevené schody, urobené kované zábradlia na jej balkónoch, opravené drevené podlahy vo veži a aj kamenná na vyhliadke, oceľová sieťovina v oknách bola nahradená drevenými oknami."
      },
      {
        type: "paragraph",
        text: "Veža „opeknela“ aj zvonku. Z medenej kupoly veže boli odstránené hrubé nánosy farby, aby opäť zažiarila meď, na jej vrchole sa upevnil kríž, ktorý bol naklonený nabok a visel už len na dvoch nitoch. Veža s výhľadom sa následne stala jednou z turistických zaujímavostí Zvolena."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1728372112/Untitled_1_9c976aced2.png",
      width: 1890,
      height: 1063,
      alt: "Veža opeknela"
    }
  },
  {
    id: "articles-143",
    slug: "krizova-cesta-v-hrinovej",
    title: "Krížová cesta v Hriňovej",
    excerpt:
      "Počasie na krížovú cestu do Hriňovej sme mali vymodlené - krásne slnečné. Ešte v ten deň doobeda pršalo. Dôverovali sme Bohu, že naše modlitby budú vyslyšané a poobede nás už bude slniečko štekliť svojimi lúčmi pri putovaní od…",
    date: "2024-05-24",
    blocks: [
      {
        type: "paragraph",
        text: "Počasie na krížovú cestu do Hriňovej sme mali vymodlené - krásne slnečné. Ešte v ten deň doobeda pršalo. Dôverovali sme Bohu, že naše modlitby budú vyslyšané a poobede nás už bude slniečko štekliť svojimi lúčmi pri putovaní od zastavenia po zastavenie. Celú krížovú cestu, ktorá bola veľmi pekná, viedol pán kaplán Jozef Benčat. Na vrchole krížovej cesty stáli tri vysoké detvianske kríže, od ktorých bol krásny výhľad na Hriňovú. Zaujímavosťou je, že túto krížovú cestu stihol posvätiť náš pán biskup Rudolf Baláž v marci 2011 a v júli v tom istom roku zomrel."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1716529756/Kriz_cesta_Hrinova_12_886c26f0e8.jpg",
      width: 6000,
      height: 4000,
      alt: "Krížová cesta v Hriňovej"
    }
  },
  {
    id: "articles-142",
    slug: "unikatny-vylet",
    title: "Unikátny výlet",
    excerpt:
      "Jarné prázdniny boli tu, a tak sme ako miništranti využili voľný čas na to, aby si spríjemnili deň s priateľmi v prírode. Zobrali sme so sebou ďalekohľad, ktorý nám umožnil pozorovať krásne okolité scenérie a v lese sme si našli…",
    date: "2024-05-17",
    blocks: [
      {
        type: "paragraph",
        text: "Jarné prázdniny boli tu, a tak sme ako miništranti využili voľný čas na to, aby si spríjemnili deň s priateľmi v prírode. Zobrali sme so sebou ďalekohľad, ktorý nám umožnil pozorovať krásne okolité scenérie a v lese sme si našli palicu, aby sa nám lepšie kráčalo. S vodou a jablkom v ruksaku sme sa vybrali na výlet. Vydali sme sa do chráneného územia Boky, neďaleko Budče, ktoré nás očarilo krásnymi výhľadmi a kamennými moriami, pozostatkami z dávnej vulkanickej činnosti. Po ceste sme spolu kecali a zabávali sa, a boli sme obklopení všadeprítomnými super náučnými tabuľami. Cieľom nášho výletu bola Čertova skala (465 m.n.m.), známa aj ako skalný hríb, ktorá predstavuje výnimočný prírodný úkaz nielen na Slovensku, ale aj v celej Strednej Európe. Impozantný balvan s objemom približne 6,5 m³ a hmotnosťou 17 ton spočíva na malej skale o veľkosti pizze hrubej 30 centimetrov. Čertova skala sa nachádza nad kamenným zrázom s výhľadom. Neďaleko od nej stojí pár menších skalnatých stien, a tak sme skúšali liezť po nich, objavujúc nové výhľady na okolité miesta. Počasie nám prialo a čas nám rýchlo ubehol. A pekné prázdniny boli o kúsok bližšie ku svojmu koncu. Ak ste s nami na Čertovej skale neboli, nezúfajte! Pripravujeme ďalší výlet v najbližšom čase a všetci chalani, ktorí by s nami chceli zažiť podobné dobrodružstvo, sú srdečne vítaní."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1715931267/Ministranti_vylet_1_f103c3d582.jpg",
      width: 4032,
      height: 3024,
      alt: "Unikátny výlet"
    }
  },
  {
    id: "articles-141",
    slug: "vylet-ministrantov-do-nitry-cesta-k-viere-a-spoznavaniu",
    title: "Výlet miništrantov do Nitry: Cesta k viere a spoznávaniu",
    excerpt:
      "Minulý víkend sa miništranti z našej farnosti spolu s miništrantami z farnosti Sliač vybrali na výlet do Nitry. Táto skupina mladých ľudí sa rozhodla objaviť viac zo sveta viery a zoznámiť sa s dôležitými miestami v Nitrianskej…",
    date: "2024-05-17",
    blocks: [
      {
        type: "paragraph",
        text: "Minulý víkend sa miništranti z našej farnosti spolu s miništrantami z farnosti Sliač vybrali na výlet do Nitry. Táto skupina mladých ľudí sa rozhodla objaviť viac zo sveta viery a zoznámiť sa s dôležitými miestami v Nitrianskej diecéze."
      },
      {
        type: "paragraph",
        text: "Našou prvou zastávkou bolo sídlo biskupa v Nitrianskej diecéze. Tam sme navštívili nádhernú Nitriansku katedrálu. Jej impozantná architektúra a duchovná atmosféra nás vtiahla do hlbších úvah o svojej viere. V katedrále sme sa zúčastnili na svätej omši, ktorú celebroval nitriansky biskup. Následne sme preskúmali históriu kostola a symboliku, ktorá sa v ňom ukrýva."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1715931162/Vylet_ministrantov_do_Nitry_1_82a7852dc2.jpg",
      width: 4160,
      height: 3120,
      alt: "Výlet miništrantov do Nitry: Cesta k viere a spoznávaniu"
    }
  },
  {
    id: "articles-140",
    slug: "stretnutie-cirkvi",
    title: "Stretnutie cirkví",
    excerpt:
      "Spoločná modlitba pomáha. Táto myšlienka rok čo rok spája začiatkom roka viaceré cirkvi na spoločných modlitbových stretnutiach. V strede týždňa modlitieb za jednotu kresťanov sa u nás stretli Rímskokatolíci, Gréckokatolíci,…",
    date: "2024-05-15",
    blocks: [
      {
        type: "paragraph",
        text: "Spoločná modlitba pomáha. Táto myšlienka rok čo rok spája začiatkom roka viaceré cirkvi na spoločných modlitbových stretnutiach. V strede týždňa modlitieb za jednotu kresťanov sa u nás stretli Rímskokatolíci, Gréckokatolíci, Evanjelici a Pravoslávni duchovní aj so svojimi veriacimi."
      },
      {
        type: "paragraph",
        text: "Utorkové popoludnie bolo modlitbové stretnutie v kostole sv. Alžbety, kde sa nám prihovoril evanjelický duchovný, Mgr. Ján Mojzsis. V evanjelickom kostole sa na ďalší deň prihovoril prítomným katolícky farár a dekan Mgr. Jozef Kraus. Posledné štvrtkové popoludnie sa konalo vo farnosti Zvolen-Sekier. Svojim príhovorom veriacich povzbudil prot. Mgr. Marek Ignacik, PhD. Hlavnou myšlienkou stretnutí bolo podobenstvo o milosrdnom samaritánovi."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1715769180/Ekumen_foto_Jozef_Kraus_3649c04758.jpg",
      width: 4000,
      height: 3000,
      alt: "Stretnutie cirkví"
    }
  },
  {
    id: "articles-139",
    slug: "karneval",
    title: "Karneval",
    excerpt:
      "Prvá februárová sobota patrila všetkým deťom našej farnosti. Ako každý rok vo fašiangovom období, sa v telocvični našej cirkevnej školy, sv. Dominika Savia uskutočnil farský detský karneval. Tento rok bol hlavnou témou Film.…",
    date: "2024-05-15",
    blocks: [
      {
        type: "paragraph",
        text: "Prvá februárová sobota patrila všetkým deťom našej farnosti. Ako každý rok vo fašiangovom období, sa v telocvični našej cirkevnej školy, sv. Dominika Savia uskutočnil farský detský karneval. Tento rok bol hlavnou témou Film. Mohli sme vidieť viaceré kreatívne a zaujímavé masky z rôznych filmov a rozprávok. Tie najlepšie boli aj ocenené. O zábavu sa starali naši mladí z farnosti, ktorí si pripravili viaceré aktivity, ako napríklad prekážková dráha či filmový kvíz. Veríme, že sa karneval všetkým páčil a tešíme sa na vás aj o rok."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1716528984/out_karneval_2024_17_A_04efc46f5d.jpg",
      width: 1331,
      height: 755,
      alt: "Karneval"
    }
  },
  {
    id: "articles-138",
    slug: "nasi-ministranti",
    title: "Naši miništranti",
    excerpt:
      "Takto sa začínal druhý týždeň zimných prázdnin a miništranti sa pobrali na chatu do Ábelovej neďaleko Detvy. Chalanov sa zišlo zo Zvolena a Lieskovca 20 a vo vedení diakona Martina spolu zamierili na chatu dominikánov. Ako už…",
    date: "2024-05-14",
    blocks: [
      {
        type: "paragraph",
        text: "Takto sa začínal druhý týždeň zimných prázdnin a miništranti sa pobrali na chatu do Ábelovej neďaleko Detvy. Chalanov sa zišlo zo Zvolena a Lieskovca 20 a vo vedení diakona Martina spolu zamierili na chatu dominikánov. Ako už býva zvykom, po ubytovaní sa na chate a umiestnení vlajky na stožiar, sa miništranti vybrali preskúmať okolie a zistiť, čo priľahlá krajina ponúka. Objavili miesto, tmavú noru, kde býva bájna postava ábelovských hôr, okolité polia, ba aj krížovú cestu blízko chaty."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1715700807/out_MINISTRANTI_CHATA_1_d2aae5157f.jpg",
      width: 2659,
      height: 1994,
      alt: "Naši miništranti"
    }
  },
  {
    id: "articles-137",
    slug: "deti-si-privstali",
    title: "Deti si privstali",
    excerpt:
      "Staviteľ sv. František Od pondelka 4.12. do piatka 15.12. prebiehali v našej farnosti ranné sv. omše ku cti Panny Márie - roráty o 6.00 hod… V peknom počte sa ich zúčastňovali deti našej farnosti za sprievodu svojich rodičov,…",
    date: "2023-12-26",
    blocks: [
      {
        type: "paragraph",
        text: "Staviteľ sv. František"
      },
      {
        type: "paragraph",
        text: "Od pondelka 4.12. do piatka 15.12. prebiehali v našej farnosti ranné sv. omše ku cti Panny Márie - roráty o 6.00 hod…"
      },
      {
        type: "paragraph",
        text: "V peknom počte sa ich zúčastňovali deti našej farnosti za sprievodu svojich rodičov, ktorí im po sv. omši na fare pripravovali raňajky."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1703610410/Roraty_4_d587e5cfb9.jpg",
      width: 6048,
      height: 4024,
      alt: "Deti si privstali"
    }
  },
  {
    id: "articles-136",
    slug: "zasli-sme-na-hlbinu",
    title: "Zašli sme na hlbinu",
    excerpt:
      "Aj v tomto roku prebiehal vo farnosti Zvolen-mesto 2. ročník kurzu „Objav Krista“. Prihlásilo sa 39 účastníkov. Večerné stretnutia boli zamerané na 5 tém. Každodenná osobná modlitba Počúvanie Boha vo Sv. písme Moc sviatostí Život…",
    date: "2023-12-26",
    blocks: [
      {
        type: "paragraph",
        text: "Aj v tomto roku prebiehal vo farnosti Zvolen-mesto 2. ročník kurzu „Objav Krista“. Prihlásilo sa 39 účastníkov. Večerné stretnutia boli zamerané na 5 tém."
      },
      {
        type: "paragraph",
        text: "Každodenná osobná modlitba Počúvanie Boha vo Sv. písme Moc sviatostí Život v moci Ducha Žiť poslanie Cirkvi"
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1703607735/NASLEDUJ_1_6c5d22c2d8.jpg",
      width: 3516,
      height: 2636,
      alt: "Zašli sme na hlbinu"
    }
  },
  {
    id: "articles-135",
    slug: "novembrove-hodovanie",
    title: "Novembrové „hodovanie“",
    excerpt:
      "Tak, ako každý november, i teraz prišiel deň „hodovej slávnosti“ vo farnosti Zvolen–mesto. Tohoročnej slávnosti predchádzal deviatnik na tému Svätosť s ľudskou tvárou. Deviatnik viedli otcovia benediktíni zo Sampora. Celebrantom…",
    date: "2023-12-26",
    blocks: [
      {
        type: "paragraph",
        text: "Tak, ako každý november, i teraz prišiel deň „hodovej slávnosti“ vo farnosti Zvolen–mesto. Tohoročnej slávnosti predchádzal deviatnik na tému Svätosť s ľudskou tvárou. Deviatnik viedli otcovia benediktíni zo Sampora."
      },
      {
        type: "paragraph",
        text: "Celebrantom a kazateľom na slávnostnej svätej omši bol dp. Štefan Hýrošš, farár z Kláštora pod Znievom. Kňaz z tejto obce bol pozvaný preto, lebo divadlo bolo za-merané na neter svätej Alžbety - svätú Margitu, ktorá sa podľa tradície narodila v Kláštore pod Znievom."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1703607823/Relikvia_sv_Alzbety_2_Kraus_fcd0f1bbc6.jpg",
      width: 3006,
      height: 1754,
      alt: "Novembrové „hodovanie“"
    }
  },
  {
    id: "articles-134",
    slug: "svaeta-teta-a-jej-neter",
    title: "Svätá teta a jej neter",
    excerpt:
      "Dve blízke svätice: Alžbeta a Margita. Svätú Alžbetu Uhorskú pozná iste každý náš farník. Ale počas tohtoročných hodov sme mohli viac spoznať aj jej neter – svätú Margitu Uhorskú. Príbeh svätej Alžbety Uhorskej je úzko spätý s…",
    date: "2023-12-26",
    blocks: [
      {
        type: "paragraph",
        text: "Dve blízke svätice: Alžbeta a Margita. Svätú Alžbetu Uhorskú pozná iste každý náš farník. Ale počas tohtoročných hodov sme mohli viac spoznať aj jej neter – svätú Margitu Uhorskú."
      },
      {
        type: "paragraph",
        text: "Príbeh svätej Alžbety Uhorskej je úzko spätý s naším mestom. Predpokladá sa, že svätá Alžbeta určitý čas žila vo Zvolene spolu so svojím otcom Ondrejom II., uhorským kráľom z rodu Arpádovcov. Alžbeta sa narodila v roku 1207 v Bratislave alebo v Maďarsku. Ako štvorročnú ju sľúbil jej otec za manželku Ľudovítovi, synovi Hermana, durínskeho grófa a poslali ju na hrad Wartburg a Eisenach. Hoci po smrti matky a grófa Hermana vládla jeho matka Žofia, ktorej prekážala Alžbetina láska voči chudobným, skromnosť aj čnosti, Ľudovít sa jej veľmi zastával a vážil si jej čnostný život. V roku 1221 si ju vzal za ženu, Alžbeta mala vtedy štrnásť rokov. Spolu mali tri deti: Hermana, Žofiu a Gertrúdu."
      }
    ],
    cover: {
      src: "https://res.cloudinary.com/dmx3wfvko/image/upload/v1703600249/out_FOTO_6_Kraus_83dfd4788b.jpg",
      width: 4032,
      height: 3024,
      alt: "Svätá teta a jej neter"
    }
  }
];

export const notices: EditorialEntry[] = [
  {
    id: "announcements-1",
    slug: "elektronicky-zvoncek",
    title: "Elektronický „zvonček“",
    excerpt:
      "Ďakujeme všetkým, ktorí svoju účasť na živote farnosti prejavujú aj poukázaním finančného milodaru. Pre jednoduchšie prispievanie na údržbu kostolov, fary a celkový chod farnosti môžete využiť elektronický zvonček: farský IBAN:…",
    date: "2023-11-13",
    blocks: [
      {
        type: "paragraph",
        text: "Ďakujeme všetkým, ktorí svoju účasť na živote farnosti prejavujú aj poukázaním finančného milodaru. Pre jednoduchšie prispievanie na údržbu kostolov, fary a celkový chod farnosti môžete využiť elektronický zvonček:"
      },
      {
        type: "paragraph",
        text: "farský IBAN: SK72 1111 0000 0066 1528 6006 QR kód: obrázok možno jednoducho načítať pomocou mobilnej aplikácie svojej banky."
      },
      {
        type: "paragraph",
        text: "Za vašu štedrosť vyslovujeme úprimné Pán Boh zaplať!Srdečne ďakujeme za vašu štedrosť formou milodarov na bankový účet farnosti. Dávame tiež do pozornosti elektronický zvonček, na ktorý môžete využiť pohodlný spôsob QR kódu, ktorý načítate pomocou svojej bankovej aplikácie."
      }
    ]
  }
];

/**
 * Illustrative times matching the legacy layout's range of daily services.
 * These are unverified design fixtures, not the parish's recurring template.
 * Do not add celebrants, intentions or liturgy to regular fallback data.
 */
export const regularSchedule: RegularSchedule = {
  0: [
    { time: "07:00" },
    { time: "08:45", location: "Lieskovec" },
    { time: "09:00" },
    { time: "10:30" },
    { time: "19:00" }
  ],
  1: [{ time: "06:30" }, { time: "12:00" }, { time: "18:00" }],
  2: [{ time: "06:30" }, { time: "12:00" }, { time: "18:00" }],
  3: [{ time: "06:30" }, { time: "12:00" }, { time: "18:00" }],
  4: [{ time: "06:30" }, { time: "12:00" }, { time: "18:00" }],
  5: [{ time: "06:30" }, { time: "12:00" }, { time: "18:00" }],
  6: [
    { time: "06:30" },
    { time: "15:00", location: "Nemocnica" },
    { time: "18:00" }
  ]
};

/**
 * Rolling synthetic schedules for visual review, including illustrative liturgy
 * labels and celebrant roles. They do not represent the liturgical calendar or
 * actual priest assignments. Never transplant personal Mass intentions.
 */
export function getFixtureBulletins(today: CalendarDate): Bulletin[] {
  const monday = getMonday(today);
  return [-7, 0, 7].map((offset) => {
    const weekStart = addDays(monday, offset);
    return {
      id: `fixture-${weekStart}`,
      weekStart,
      published: true,
      days: Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const weekday = (index + 1) % 7;
        return {
          date,
          liturgy:
            weekday === 0
              ? "Nedeľa v cezročnom období"
              : weekday === 6
              ? "Preblahoslavenej Panny Márie v sobotu"
              : "Féria v cezročnom období",
          status: "scheduled" as const,
          masses: (regularSchedule[weekday] ?? []).map((mass, massIndex) => ({
            ...mass,
            ...(weekday === 0 && massIndex === 3 ? { label: "Detská" } : {}),
            celebrant: ["Farár", "Kaplán", "Hosť"][massIndex % 3],
            intention: "Za farnosť"
          }))
        };
      }),
      announcements: [
        "Toto je ukážkový rozpis na overenie návrhu stránky. Údaje nie sú aktuálne farské oznamy.",
        "Po svätých omšiach vás pozývame na spoločné stretnutie vo farskom spoločenstve.",
        "Ďakujeme všetkým dobrovoľníkom za pomoc pri upratovaní a príprave kostola."
      ]
    };
  });
}
