export interface Route {
  label: string;
  to: string;
  children?: Route[];
  showInMenu?: boolean;
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
      // asRoute({
      //   label: "Kalendár akcií",
      //   to: "/kalendar-akcii"
      // }),
      asRoute({
        label: "O farnosti",
        to: "/o-farnosti-zvolen-mesto"
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
        label: "Galéria",
        to: "/galeria"
      }),
      asRoute({
        label: "Virtuálna prehliadka",
        to: "/virtualna-prehliadka"
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
        label: "Sviatost zmierenia",
        to: "/sviatost-zmierenia"
      }),
      asRoute({
        label: "Sviatosť eucharistie",
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
        label: "Pomazania chorých",
        to: "/sviatost-pomazania-chorych"
      })
    ]
  }),
  groups: asRoute({
    label: "Spoločenstvá",
    to: "/spolocenstva",
    children: [
      asRoute({
        label: "Miništranti",
        to: "/ministranti"
      }),
      asRoute({
        label: "Mládežnícky zbor",
        to: "/mladeznicky-zbor"
      }),
      asRoute({
        label: "Detský spevokol",
        to: "/detsky-spevokol"
      }),
      asRoute({
        label: "Ružencové bratstvo",
        to: "/ruzencove-bratstvo"
      }),
      asRoute({
        label: "Akolyti",
        to: "/akolyti"
      })
    ]
  }),
  contact: asRoute({
    label: "Kontakt",
    to: "/kontakt"
  })
};

export const routesArray = Object.values(routes);
