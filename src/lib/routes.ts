export interface Route {
    label: string;
    to: string;
    children?: Route[];
    showInMenu?: boolean;
}

const asRoute = (route: Route): Route => route;

export const routes = {
    home: asRoute({
        label: 'Domov',
        to: '/',
    }),
    parish: asRoute({
        label: 'Farnosť',
        to: '/farnost',
        children: [
            asRoute({
                label: 'Farské oznamy',
                to: '/farske-oznamy',
            }),
            asRoute({
                label: 'História',
                to: '/historia',
            }),
            asRoute({
                label: 'Naše Spoločenstvo',
                to: '/nase-spolocenstvo',
            }),
            asRoute({
                label: 'Farské oznamy',
                to: '/farske-oznamy',
            }),
            asRoute({
                label: 'História',
                to: '/historia',
            }),
            asRoute({
                label: 'Naše Spoločenstvo',
                to: '/nase-spolocenstvo',
            }),
        ],
    }),
    sacraments: asRoute({
        label: 'Sviatosti',
        to: '/sviatosti',
        children: [
            asRoute({
                label: 'Krst',
                to: '/krst',
            }),
            asRoute({
                label: 'Sväté pirjímanie',
                to: '/svate-prijimanie',
            }),
            asRoute({
                label: 'Birmovka',
                to: '/birmovka',
            }),
            asRoute({
                label: 'Sviatosť manželstva',
                to: '/sviatost-manzelstva',
            }),
            asRoute({
                label: 'História',
                to: '/historia',
            }),
        ],
    }),
    groups: asRoute({
        label: 'Spoločenstvá',
        to: '/spolocenstva',
    }),
    contact: asRoute({
        label: 'Kontat',
        to: '/kontakt',
    }),
};

export const routesArray = Object.values(routes);
