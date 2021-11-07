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
        label: "Kalendár akcií",
        to: "/farske-oznamy"
      }),
      asRoute({
        label: "História farnosti",
        to: "/historia-farnosti"
      }),
      asRoute({
        label: "Naše Spoločenstvo",
        to: "/nase-spolocenstvo"
      }),
      asRoute({
        label: "Farský kostol",
        to: "/farsky-kostol"
      })
    ]
  }),
  sacraments: asRoute({
    label: "Sviatosti",
    to: "/sviatosti",
    children: [
      asRoute({
        label: "Krst",
        to: "/krst"
      }),
      asRoute({
        label: "Sväté pirjímanie",
        to: "/svate-prijimanie"
      }),
      asRoute({
        label: "Birmovka",
        to: "/birmovka"
      }),
      asRoute({
        label: "Sviatosť manželstva",
        to: "/sviatost-manzelstva"
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
        to: "/sviatost-manzelstva"
      }),
      asRoute({
        label: "Ružencové bratstvo",
        to: "/ruzencove-bratstvo"
      }),
      asRoute({
        label: "Akolyti",
        to: "/Akolyti"
      })
    ]
  }),
  contact: asRoute({
    label: "Kontakt",
    to: "/kontakt"
  })
};

export const routesArray = Object.values(routes);
