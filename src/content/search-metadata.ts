/** Search/share copy is independent of visible headings and preserved source text.
 * Editorial corrections below were reviewed against public pages on 4 November 2026.
 */
interface SearchMetadataCopy {
  title?: string;
  description: string;
}

export const searchMetadataByPath: Readonly<
  Partial<Record<string, SearchMetadataCopy>>
> = {
  "/kontakt": {
    title: "Kontakt a úradné hodiny",
    description:
      "Kontakty a úradné hodiny farskej kancelárie Zvolen – mesto. Telefón, e-mail a informácie, ako dohodnúť sviatosť alebo vybaviť doklady."
  },
  "/sviatosti/sviatost-krstu": {
    description:
      "Krst dieťaťa vo farnosti Zvolen – mesto. Informácie o príprave, krstných rodičoch, potrebných dokladoch a dohodnutí termínu krstu."
  },
  "/sviatosti/sviatost-eucharistie": {
    description:
      "Prvé sväté prijímanie vo farnosti Zvolen – mesto. Informácie o Eucharistii, príprave detí a dospelých a kontakte s farskou kanceláriou."
  },
  "/sviatosti/sviatost-birmovania": {
    description:
      "Birmovanie vo farnosti Zvolen – mesto. Čo znamená sviatosť birmovania a kde získať informácie o príprave a aktuálnych termínoch."
  },
  "/sviatosti/sviatost-manzelstva": {
    description:
      "Cirkevný sobáš vo farnosti Zvolen – mesto. Informácie pre snúbencov o príprave na manželstvo, dokladoch a dohodnutí termínu sobáša."
  },
  "/sviatosti/sviatost-zmierenia": {
    description:
      "Sviatosť zmierenia vo farnosti Zvolen – mesto. Informácie o spovedi, príprave a dohodnutí individuálneho termínu s kňazom."
  },
  "/sviatosti/sviatost-pomazania-chorych": {
    description:
      "Pomazanie chorých vo farnosti Zvolen – mesto. Informácie o sviatosti a dohodnutí návštevy kňaza u chorého alebo v nemocnici."
  },
  "/farnost/kostol-sv-alzbety": {
    description:
      "Kostol sv. Alžbety na námestí vo Zvolene. História farského kostola, fotografie a informácie o mieste modlitby našej farnosti."
  },
  "/farnost/o-farnosti": {
    description:
      "História Farnosti sv. Alžbety Zvolen – mesto. Dôležité obdobia, osobnosti a udalosti, ktoré formovali život farského spoločenstva."
  },
  "/farnost/kostol-sv-jana-pavla-v-lieskovci": {
    title: "Kostol sv. Jána Pavla II. v Lieskovci",
    description:
      "Kostol sv. Jána Pavla II. v Lieskovci patrí do farnosti Zvolen – mesto. História, fotografie a informácie o filiálnom kostole."
  },
  "/farnost/kostol-sv-matusa-v-zolnej": {
    description:
      "Ranogotický Kostol sv. Matúša v Zolnej pri Zvolene. História filiálneho kostola, jeho výzdoba a fotografie vzácnej pamiatky."
  },
  "/spolocenstva/detsky-spevokol": {
    description:
      "Detský spevokol Alžbetka vo farnosti Zvolen – mesto. Spev, spoločné aktivity a informácie pre deti a rodičov, ktorí sa chcú pridať."
  },
  "/spolocenstva/mladeznicky-zbor": {
    description:
      "Mládežnícky zbor Alžbeta vo farnosti Zvolen – mesto. Spoznajte spoločenstvo mladých, ktorých spája viera, hudba a služba pri svätej omši."
  },
  "/spolocenstva/ministranti": {
    description:
      "Miništranti farnosti Zvolen – mesto. Služba pri oltári, spoločné stretnutia a informácie pre chlapcov, ktorí sa chcú zapojiť."
  },
  "/spolocenstva/akolyti": {
    description:
      "Akolyti vo farnosti Zvolen – mesto. Služba pri oltári a prinášanie svätého prijímania chorým a starším členom spoločenstva."
  },
  "/spolocenstva/reholne-sestry": {
    description:
      "Rehoľné sestry vo farnosti Zvolen – mesto. Kongregácia Dcér sv. Františka Assiského, jej história a služba farskému spoločenstvu."
  },
  "/spolocenstva/lektori": {
    description:
      "Lektori vo farnosti Zvolen – mesto. Informácie o službe čítania Božieho slova pri liturgii a jej mieste v živote spoločenstva."
  },
  "/farnost/cirkevna-skola": {
    description:
      "Základná škola sv. Dominika Savia vo Zvolene. Informácie o cirkevnej škole spojenej s našou farnosťou a odkaz na jej web."
  },
  "/objav-krista": {
    title: "Objav Krista – informácie a prihlásenie",
    description:
      "Objav Krista vo farnosti Zvolen – mesto. Informácie o kurze a odkaz na prihlasovací formulár pre váš ďalší krok vo viere."
  },
  "/den-farskej-rodiny": {
    description:
      "Deň farskej rodiny vo Zvolene. Informácie o spoločnom stretnutí farníkov; aktuálne podujatia nájdete vo farských oznamoch."
  },
  "/farnost/kalendar-akcii": {
    description:
      "Kalendár akcií farnosti Zvolen – mesto. Kde nájsť aktuálne farské stretnutia, slávnosti a podujatia v oznamoch a na výveske."
  },
  "/farnost/nase-spolocenstvo/objav-krista": {
    title: "Objav Krista – stretnutie v roku 2022",
    description:
      "Ako sa vo Zvolene začal kurz Objav Krista v roku 2022. Stretnutie farníkov pri modlitbe a prednáškach s pátrami redemptoristami."
  },
  "/farnost/nase-spolocenstvo/napisali-ste-nam": {
    title: "Napísali ste nám – ohlasy na časopis (2021)",
    description:
      "Čitatelia reagujú na novú podobu farského časopisu Naše spoločenstvo. Ohlasy na jeho obsah, fotografie a grafiku z decembra 2021."
  },
  "/farnost/nase-spolocenstvo/napisali-ste-nam-1": {
    title: "Napísali ste nám – Vianoce v tichu (2022)",
    description:
      "Osobné svedectvo o Vianociach v tichu, chorobe a modlitbe. Čitateľský príspevok v časopise Naše spoločenstvo z marca 2022."
  },
  "/farnost/nase-spolocenstvo/kratke-spravy-1": {
    title: "Krátke správy – marec 2022",
    description:
      "Bilancia farského života od leta do zimy: detské tábory, stretnutia mládeže a spoločný spev. Krátke správy z marca 2022."
  },
  "/farnost/nase-spolocenstvo/kratke-spravy-2": {
    title: "Krátke správy – marec 2023",
    description:
      "Vianoce vo farnosti Zvolen – mesto, jasličková pobožnosť a koledovanie Dobrej noviny. Krátke správy v časopise z marca 2023."
  },
  "/farnost/nase-spolocenstvo/kratke-spravy-3": {
    title: "Krátke správy – júl 2023",
    description:
      "Vigília Zoslania Ducha Svätého, obnova ľudových misií a slávnosť Božieho tela vo Zvolene. Farské správy z júla 2023."
  },
  "/farnost/nase-spolocenstvo/hodova-slavnost": {
    title: "Hodová slávnosť v Zolnej (2023)",
    description:
      "Hodová svätá omša v Kostole sv. Matúša v Zolnej s pátrom Rafaelom a speváckym zborom z Lieskovca. Správa z roku 2023."
  },
  "/prispevky/moj-syn-frantisek": {
    title: "Hodová slávnosť a Môj syn, František",
    description:
      "Pozvanie na hodovú slávnosť farnosti Zvolen – mesto: deviatnik, adorácia, slávnostná omša a premiéra divadla Môj syn, František."
  },
  "/farnost/nase-spolocenstvo/zo-zivota-skoly": {
    title: "Zo života školy – jún 2022",
    description:
      "Krížová cesta žiakov cirkevnej školy vo Zvolene a modlitba za mier. Zo života školy v časopise Naše spoločenstvo z júna 2022."
  },
  "/farnost/nase-spolocenstvo/zo-zivota-skoly-1": {
    title: "Zo života školy – marec 2023",
    description:
      "Športové úspechy žiakov, požehnávanie tried a súťaž Šaliansky Maťko. Zo života cirkevnej školy vo Zvolene v marci 2023."
  },
  "/farnost/nase-spolocenstvo/kantrove-dni": {
    // The published body repeats the Zolná report. Do not invent a different event.
    description:
      "Kántrové dni – príspevok farského časopisu Naše spoločenstvo, publikovaný 13. novembra 2023 vo farnosti Zvolen – mesto."
  }
};
