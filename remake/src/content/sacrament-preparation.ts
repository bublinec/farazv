export interface SacramentPreparation {
  title: string;
  steps: readonly {
    when: string;
    title: string;
    description: string;
  }[];
}

/** Summaries of the existing guidance; the complete conditions remain in the main reading. */
export const sacramentPreparation: Readonly<
  Partial<Record<string, SacramentPreparation>>
> = {
  "sviatosti/sviatost-krstu": {
    title: "Krst dieťaťa",
    steps: [
      {
        when: "Najneskôr týždeň pred krstom",
        title: "Nahlásenie krstu",
        description:
          "Rodič alebo zákonný zástupca požiada o krst počas úradných hodín farskej kancelárie."
      },
      {
        when: "Vo farskej kancelárii",
        title: "Žiadosť a termíny",
        description:
          "Prineste kópiu rodného listu a dohodnite si termín krstu aj krstnej náuky."
      },
      {
        when: "Pred krstom",
        title: "Krstná náuka",
        description:
          "Na dohodnutú náuku príde aspoň jeden rodič a krstný rodič dieťaťa."
      },
      {
        when: "V deň krstu",
        title: "Svieca a biela košieľka",
        description:
          "Košieľku označte menom dieťaťa, dátumom narodenia a dátumom krstu."
      }
    ]
  },
  "sviatosti/sviatost-eucharistie": {
    title: "Prvé prijímanie detí",
    steps: [
      {
        when: "V škole",
        title: "Prihlásenie u katechétu",
        description: "Dieťa prihláste u katechétov v škole, ktorú navštevuje."
      },
      {
        when: "Počas prípravy",
        title: "Stretnutia a rozhovor",
        description:
          "Prípravu dopĺňajú farské stretnutia a rozhovor dieťaťa s kňazom a katechétmi."
      },
      {
        when: "Najneskôr dva týždne vopred",
        title: "Krstný list pri krste mimo farnosti",
        description:
          "Ak bolo dieťa pokrstené mimo farnosti Zvolen-mesto, prineste jeho krstný list."
      },
      {
        when: "Po príprave",
        title: "Prvé sväté prijímanie",
        description:
          "Dieťa pristupuje k Eucharistii po príprave a preukázaní pripravenosti na jej prijatie."
      }
    ]
  },
  "sviatosti/sviatost-birmovania": {
    title: "Birmovanie krok za krokom",
    steps: [
      {
        when: "Na začiatku",
        title: "Aktuálne prihlásenie a termíny",
        description:
          "Aktuálne informácie nájdete vo farských oznamoch alebo vo farskej kancelárii."
      },
      {
        when: "Pri prihlásení",
        title: "Odovzdanie prihlášky",
        description:
          "Prihláškou sa zaväzujete plniť podmienky birmovnej prípravy uvedené v hlavnom texte."
      },
      {
        when: "Počas prípravy",
        title: "Stretnutia a život viery",
        description:
          "K príprave patria sväté omše, spoveď, katechézy, stretnutia a prehlbovanie náboženských vedomostí."
      },
      {
        when: "Pred prijatím sviatosti",
        title: "Výber birmovného rodiča",
        description:
          "Vyberte človeka, ktorý spĺňa uvedené podmienky a žije primerane viere a svojej úlohe."
      }
    ]
  },
  "sviatosti/sviatost-manzelstva": {
    title: "Príprava na sobáš",
    steps: [
      {
        when: "Najneskôr štyri mesiace vopred",
        title: "Nahlásenie sobáša",
        description:
          "Navštívte farskú kanceláriu počas úradných hodín a dohodnite ďalší postup."
      },
      {
        when: "Pri spisovaní zápisnice",
        title: "Doklady a údaje o svedkoch",
        description:
          "Zápisnicu spisujú osobne obaja snúbenci; pripravte potrebné listiny a údaje o svedkoch."
      },
      {
        when: "Pred sobášom",
        title: "Predmanželský kurz",
        description:
          "Absolvujte kurz garantovaný katolíckym kňazom a prineste potvrdenie o jeho absolvovaní."
      },
      {
        when: "Pred sobášom",
        title: "Štátna sobášna zápisnica",
        description:
          "Vybavíte ju na Mestskom úrade vo Zvolene, pokiaľ ste ešte neuzavreli civilné manželstvo."
      },
      {
        when: "Najneskôr týždeň pred sobášom",
        title: "Kvetinová výzdoba, ak ju žiadate",
        description:
          "Ak si žiadate výzdobu kostola, prineste príspevok včas na objednanie kvetov."
      },
      {
        when: "V týždni po sobáši",
        title: "Prevzatie sobášneho listu",
        description:
          "Po doručení štátnej zápisnice farským úradom si sobášny list prevezmete na mestskom úrade."
      }
    ]
  }
};
