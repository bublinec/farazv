export interface SacramentPreparation {
  title: string;
  introduction: string;
  steps: readonly {
    when: string;
    title: string;
    description: string;
  }[];
}

/** Summaries of the existing guidance; the complete conditions remain below. */
export const sacramentPreparation: Readonly<
  Partial<Record<string, SacramentPreparation>>
> = {
  "sviatosti/sviatost-krstu": {
    title: "Krst dieťaťa krok za krokom",
    introduction:
      "Prehľad pre rodičov dieťaťa. Informácie o krste dospelých a úplné podmienky nájdete nižšie.",
    steps: [
      {
        when: "Čo najskôr po narodení",
        title: "Nahláste krst",
        description:
          "O krst žiada rodič alebo zákonný zástupca vo farskej kancelárii počas úradných hodín, najneskôr týždeň pred plánovaným krstom."
      },
      {
        when: "Vo farskej kancelárii",
        title: "Vyplňte žiadosť a dohodnite termíny",
        description:
          "Prineste kópiu rodného listu dieťaťa. Spolu so žiadosťou si dohodnite termín krstu aj krstnej náuky."
      },
      {
        when: "Pred krstom",
        title: "Zúčastnite sa krstnej náuky",
        description:
          "Na vopred dohodnutú náuku prichádzajú rodičia a krstní rodičia dieťaťa, aspoň jeden rodič a krstný rodič."
      },
      {
        when: "V dohodnutý deň krstu",
        title: "Prineste sviecu a košieľku",
        description:
          "Na krst prineste krstnú sviecu a bielu košieľku s menom dieťaťa, dátumom narodenia a dátumom krstu."
      }
    ]
  },
  "sviatosti/sviatost-eucharistie": {
    title: "Prvé sväté prijímanie krok za krokom",
    introduction:
      "Prehľad prípravy detí. Postup pri prvom prijatí Eucharistie v dospelosti nájdete v podrobných informáciách nižšie.",
    steps: [
      {
        when: "Prihlásenie dieťaťa",
        title: "Obráťte sa na katechétu v škole",
        description:
          "S úmyslom prihlásiť dieťa oslovte katechétov v škole, ktorú navštevuje. K príprave patrí náboženská výchova, zvlášť v treťom ročníku ZŠ."
      },
      {
        when: "Počas bezprostrednej prípravy",
        title: "Stretnutia a osobný rozhovor",
        description:
          "Dieťa absolvuje stretnutia vo farských priestoroch a rozhovor s kňazom a katechétmi, pri ktorom preukáže pripravenosť na prijatie Eucharistie."
      },
      {
        when: "Najneskôr dva týždne pred slávnosťou",
        title: "Doručte krstný list, ak treba",
        description:
          "Ak bolo dieťa pokrstené mimo farnosti Zvolen-mesto, prineste jeho krstný list najneskôr dva týždne pred prvým svätým prijímaním."
      },
      {
        when: "Prijatie sviatosti",
        title: "Prvé sväté prijímanie",
        description:
          "Dieťa pristupuje k prvému svätému prijímaniu po príprave a preukázaní pripravenosti na prijatie sviatosti Eucharistie."
      }
    ]
  },
  "sviatosti/sviatost-birmovania": {
    title: "Príprava na birmovanie krok za krokom",
    introduction:
      "Aktuálne prihlásenie a termíny si overte vo farských oznamoch alebo vo farskej kancelárii.",
    steps: [
      {
        when: "Na začiatku",
        title: "Overte si aktuálne prihlásenie",
        description:
          "Informácie o aktuálnej príprave a termínoch stretnutí nájdete vo farských oznamoch alebo vám ich poskytne farská kancelária."
      },
      {
        when: "Pri prihlásení",
        title: "Odovzdajte prihlášku",
        description:
          "Odovzdaním prihlášky sa zaväzujete plniť podmienky birmovnej prípravy. Ich úplný zoznam nájdete nižšie."
      },
      {
        when: "Počas prípravy",
        title: "Zapojte sa do stretnutí a života viery",
        description:
          "Príprava trvá približne jeden školský rok. Patrí k nej účasť na svätých omšiach, spoveď, katechézy, stretnutia a získavanie primeraných náboženských vedomostí."
      },
      {
        when: "Pred prijatím sviatosti",
        title: "Vyberte birmovného rodiča",
        description:
          "Birmovný rodič má spĺňať uvedené podmienky vrátane prijatia birmovania a Eucharistie a života primeraného viere a svojej úlohe."
      }
    ]
  },
  "sviatosti/sviatost-manzelstva": {
    title: "Príprava na sobáš krok za krokom",
    introduction:
      "Začnite včas. Podrobné podmienky, potrebné listiny a osobitné situácie nájdete nižšie.",
    steps: [
      {
        when: "Najneskôr štyri mesiace pred sobášom",
        title: "Oznámte svoj úmysel vo farskej kancelárii",
        description:
          "Navštívte farský úrad počas úradných hodín a dohodnite ďalší postup. Niektoré administratívne úkony si vyžadujú dlhší čas."
      },
      {
        when: "Pri spisovaní zápisnice",
        title: "Pripravte potrebné listiny",
        description:
          "Osobne musia prísť obaja snúbenci. Pripravte požadované doklady a údaje o svedkoch; krstný list z inej farnosti nesmie byť starší ako šesť mesiacov."
      },
      {
        when: "Pred sobášom",
        title: "Absolvujte predmanželskú prípravu",
        description:
          "Kurz môžete absolvovať v našej farnosti alebo inde, ak je garantovaný katolíckym kňazom. Prineste potvrdenie o absolvovaní; aktuálne termíny si overte vo farskej kancelárii."
      },
      {
        when: "Pred sobášom",
        title: "Vybavte štátnu sobášnu zápisnicu",
        description:
          "Na Mestskom úrade vo Zvolene budete potrebovať rodné listy a platné občianske preukazy. Táto požiadavka sa netýka tých, ktorí už uzavreli civilné manželstvo."
      },
      {
        when: "Minimálne týždeň pred sobášom",
        title: "Dohodnite kvetinovú výzdobu, ak ju žiadate",
        description:
          "Ak si žiadate kvetinovú výzdobu kostola, prineste príspevok na tento účel minimálne týždeň pred sobášom, aby sa kvety mohli objednať včas."
      },
      {
        when: "V týždni po sobáši",
        title: "Prevezmite si sobášny list",
        description:
          "Farský úrad doručí štátnu zápisnicu na Mestský úrad vo Zvolene, kde si môžete prevziať sobášny list."
      }
    ]
  }
};
