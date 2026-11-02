export interface SacramentPreparation {
  title: string;
  steps: readonly {
    when: string;
    title: string;
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
        title: "Nahlásenie krstu"
      },
      {
        when: "Vo farskej kancelárii",
        title: "Žiadosť a termíny"
      },
      {
        when: "Pred krstom",
        title: "Krstná náuka"
      },
      {
        when: "V deň krstu",
        title: "Svieca a biela košieľka"
      }
    ]
  },
  "sviatosti/sviatost-eucharistie": {
    title: "Prvé prijímanie detí",
    steps: [
      {
        when: "V škole",
        title: "Prihlásenie u katechétu"
      },
      {
        when: "Počas prípravy",
        title: "Stretnutia a rozhovor"
      },
      {
        when: "Najneskôr dva týždne vopred",
        title: "Krstný list pri krste mimo farnosti"
      },
      {
        when: "Po príprave",
        title: "Prvé sväté prijímanie"
      }
    ]
  },
  "sviatosti/sviatost-birmovania": {
    title: "Birmovanie krok za krokom",
    steps: [
      {
        when: "Na začiatku",
        title: "Aktuálne prihlásenie a termíny"
      },
      {
        when: "Pri prihlásení",
        title: "Odovzdanie prihlášky"
      },
      {
        when: "Počas prípravy",
        title: "Stretnutia a život viery"
      },
      {
        when: "Pred prijatím sviatosti",
        title: "Výber birmovného rodiča"
      }
    ]
  },
  "sviatosti/sviatost-manzelstva": {
    title: "Príprava na sobáš",
    steps: [
      {
        when: "Najneskôr štyri mesiace vopred",
        title: "Nahlásenie sobáša"
      },
      {
        when: "Pri spisovaní zápisnice",
        title: "Doklady a údaje o svedkoch"
      },
      {
        when: "Pred sobášom",
        title: "Predmanželský kurz"
      },
      {
        when: "Pred sobášom",
        title: "Štátna sobášna zápisnica"
      },
      {
        when: "Najneskôr týždeň pred sobášom",
        title: "Kvetinová výzdoba, ak ju žiadate"
      },
      {
        when: "V týždni po sobáši",
        title: "Prevzatie sobášneho listu"
      }
    ]
  }
};
