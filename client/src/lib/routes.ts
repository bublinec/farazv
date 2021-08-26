export interface Route {
  label: string;
  to: string;
  showInMenu?: boolean;
}

const asRoute = (route: Route): Route => (route)

export const routes = {
  home: asRoute({
    label: "Domov",
    to: "/"
  })
};