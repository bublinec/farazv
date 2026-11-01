import { churchDetails } from "./church-details";

/** Researched 1 November 2026. Keep church history separate from parish history. */
export const churchHistory = {
  href: "/farnost/kostol-sv-alzbety",
  parishHref: "/farnost/o-farnosti",
  sources: {
    monuments: {
      label: "Mesto Zvolen – Pamiatky v meste",
      href: "https://www.zvolen.sk/pamiatky-v-meste.html"
    },
    register: {
      label: "Mesto Zvolen – Národné kultúrne pamiatky",
      href: "https://www.zvolen.sk/nkp-vo-zvolene.html"
    },
    archaeology: {
      label: "Archeologický ústav SAV – konferenčné materiály, 2017, s. 37",
      href: "https://archeol.sav.sk/files/konferencia_text_DO-TLACE2.pdf#page=37"
    },
    tower: {
      label: "Mesto Zvolen – Kostolná veža",
      href: "https://www.zvolen.sk/oplati-sa-vidiet.html"
    }
  },
  sections: [
    {
      title: "Stredoveké začiatky",
      paragraphs: [
        "Kostol sv. Alžbety je súčasťou zvolenského námestia už od stredoveku. Jeho stavebné počiatky siahajú do polovice 13. storočia; mestský prehľad pamiatok uvádza roky 1244 – 1250. Patrí tak k najstarším zachovaným miestam kresťanského života v meste.",
        "Pôvodne jednoloďová stavba spájala neskororománske a ranogotické prvky. Výraznou gotickou prestavbou prešla v rokoch 1380 – 1390. Z tohto obdobia sa zachovali rebrové klenby v sakristii a priľahlej kaplnke, empora s lomenými oblúkmi aj kamenný portál."
      ],
      sources: ["monuments"] as const
    },
    {
      title: "Kostol uprostred mesta",
      paragraphs: [
        "Okolie kostola malo kedysi inú podobu než dnešná otvorená pešia zóna. Areál ohraničoval múr a nachádzal sa v ňom cintorín. Ku kostolu postupne pribudli priestory spojené so životom mesta vrátane radnice a špitála.",
        "Veža postavená v rokoch 1548 – 1551 nebola iba zvonicou. Počas protitureckých bojov slúžila aj na stráženie mesta a odovzdávanie signálov. Nad zvonmi sa nachádzalo podlažie pre strážnika a ochodza, z ktorej mohol sledovať okolie."
      ],
      sources: ["archaeology"] as const
    },
    {
      title: "Premeny interiéru a Mariánska kaplnka",
      paragraphs: [
        "V období reformácie kostol spravovali evanjelici. S týmto obdobím súvisia bočné tribúny aj zaklenutie lode so štukovými rebrami. Ďalšie úpravy prinieslo baroko, ktoré v priebehu 18. storočia doplnilo staršiu stavbu o novú výtvarnú vrstvu.",
        "Na južnej strane kostola sa nachádza Kaplnka Sedembolestnej Panny Márie, známa aj ako Mariánska kaplnka. Jej vývoj je spätý s prestavbami v 17. storočí. V jednom kostole sa tak stretávajú stredoveké stavebné prvky s mladšími kaplnkami a zariadením."
      ],
      // City sources and the archaeological guide differ on the chapel's exact
      // year (1648, 1650, after 1673); retain the supported century here.
      sources: ["archaeology", "register"] as const
    },
    {
      title: "Detaily, pri ktorých sa oplatí zastaviť",
      paragraphs: [
        "V interiéri zostala zachovaná kamenná renesančná krstiteľnica z roku 1621. K starším pamiatkam patria aj náhrobné epitafy; jeden z nich pripomína Nikodéma Sartoriusa a nesie letopočet 1595. Organ pochádza z druhej polovice 18. storočia.",
        "Aj veža prešla viacerými obnovami. Po požiari v roku 1709 bola nadstavená. V rokoch 2017 – 2019 sa opravovali jej priestory a schodisko, aby sa mohla opäť sprístupniť návštevníkom. Aktuálne možnosti návštevy si overte v informačnom centre mesta."
      ],
      sources: ["monuments", "register", "tower"] as const
    }
  ],
  tours: [
    {
      title: "Mariánska kaplnka v 3D",
      description: "Prezrite si priestor kaplnky zo všetkých strán.",
      href: "https://sketchfab.com/3d-models/kaplnka-ba87a3588d624facabb1bb8ef27a786e",
      image: churchDetails.chapel
    },
    {
      title: "Oltár v 3D",
      description: "Pozrite sa bližšie na tvar a detaily oltára.",
      href: "https://sketchfab.com/3d-models/oltar-v-kostole-sv-alzbety-vo-zvolene-e182d079f96641f49d876abdd4735f3d",
      image: churchDetails.interior
    }
  ]
};
