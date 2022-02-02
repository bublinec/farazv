export interface Route {
  label: string;
  to: string;
  children?: Route[];
  showInMenu?: boolean;
  isExternal?: boolean;
}

const asRoute = (route: Route): Route => route;

export const routes = {
  home: asRoute({
    label: "Domov",
    to: "/"
  }),
  parish: asRoute({
    label: "Farnosť",
    to: "/farnost",
    children: [
      asRoute({
        label: "Farské oznamy",
        to: "/farske-oznamy"
      }),
      asRoute({
        label: "Naše Spoločenstvo",
        to: "/nase-spolocenstvo"
      }),
      asRoute({
        label: "Galéria kostola",
        to: "/galeria"
      }),
      // asRoute({
      //   label: "Kalendár akcií",
      //   to: "/kalendar-akcii"
      // }),
      asRoute({
        label: "Kostol sv. Alžbety",
        to: "/kostol-sv-alzbety"
      }),
      asRoute({
        label: "Kostol v Lieskovci",
        to: "/kostol-sv-jana-pavla-v-lieskovci"
      }),
      asRoute({
        label: "Kostol v Zolnej",
        to: "/kostol-sv-matusa-v-zolnej"
      }),
      asRoute({
        label: "Cirkevná škola",
        to: "/cirkevna-skola"
      }),
      asRoute({
        label: "Charita",
        to: "https://www.charitazvolen.sk/",
        isExternal: true
      })
      // asRoute({
      //   label: "Farský kostol",
      //   to: "/farsky-kostol"
      // })
    ]
  }),
  sacraments: asRoute({
    label: "Sviatosti",
    to: "/sviatosti",
    children: [
      asRoute({
        label: "Sviatost krstu",
        to: "/sviatost-krstu"
      }),
      asRoute({
        label: "Sviatosť Eucharistie",
        to: "/sviatost-eucharistie"
      }),
      asRoute({
        label: "Sviatost birmovania",
        to: "/sviatost-birmovania"
      }),
      asRoute({
        label: "Sviatosť manželstva",
        to: "/sviatost-manzelstva"
      }),
      asRoute({
        label: "Sviatost zmierenia",
        to: "/sviatost-zmierenia"
      }),
      asRoute({
        label: "Pomazanie chorých",
        to: "/sviatost-pomazania-chorych"
      })
    ]
  }),
  groups: asRoute({
    label: "Spoločenstvá",
    to: "/spolocenstva",
    children: [
      asRoute({
        label: "Detský spevokol",
        to: "/detsky-spevokol"
      }),
      asRoute({
        label: "Mládežnícky zbor",
        to: "/mladeznicky-zbor"
      }),
      asRoute({
        label: "Miništranti",
        to: "/ministranti"
      }),
      asRoute({
        label: "Rehoľné sestry",
        to: "/reholne-sestry"
      })
      // asRoute({
      //   label: "Ružencové bratstvo",
      //   to: "/ruzencove-bratstvo"
      // }),
      // asRoute({
      //   label: "Akolyti",
      //   to: "/akolyti"
      // })
    ]
  }),
  contact: asRoute({
    label: "Kontakt",
    to: "/kontakt"
  })
};

export const routesArray = Object.values(routes);
