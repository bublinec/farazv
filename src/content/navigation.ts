import { parishServices } from "./services";
import { hospitalMinistry } from "./hospital-ministry";
import { pageGroups, type PublicPageLink } from "./page-documents";

export interface NavigationItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export const navigation: NavigationItem[] = [
  { label: "Domov", href: "/" },
  {
    label: "Farnosť",
    children: [
      { label: "O farnosti", href: "/farnost/o-farnosti" },
      { label: "Kostol sv. Alžbety", href: "/farnost/kostol-sv-alzbety" },
      {
        label: "Kostol v Lieskovci",
        href: "/farnost/kostol-sv-jana-pavla-v-lieskovci"
      },
      { label: "Kostol v Zolnej", href: "/farnost/kostol-sv-matusa-v-zolnej" },
      { label: "Naše spoločenstvo", href: "/farnost/nase-spolocenstvo" },
      { label: hospitalMinistry.title, href: hospitalMinistry.href },
      { label: "Cirkevná škola", href: "/farnost/cirkevna-skola" },
      { label: "Rehoľné sestry", href: "/spolocenstva/reholne-sestry" },
      { label: "Charita", href: "https://www.charitazvolen.sk/" }
    ]
  },
  {
    label: "Sviatosti",
    children: [
      { label: "Krst", href: "/sviatosti/sviatost-krstu" },
      { label: "Eucharistia", href: "/sviatosti/sviatost-eucharistie" },
      { label: "Birmovanie", href: "/sviatosti/sviatost-birmovania" },
      { label: "Manželstvo", href: "/sviatosti/sviatost-manzelstva" },
      { label: "Zmierenie", href: "/sviatosti/sviatost-zmierenia" },
      {
        label: "Pomazanie chorých",
        href: "/sviatosti/sviatost-pomazania-chorych"
      }
    ]
  },
  {
    label: "Služby vo farnosti",
    children: parishServices.map(({ title, href }) => ({ label: title, href }))
  },
  { label: "Kontakt", href: "/kontakt" }
];

/** Append pages added in the administration to the end of their menu group. */
export function navigationWithPages(pages: PublicPageLink[]): NavigationItem[] {
  if (!pages.length) return navigation;

  return navigation.map((item) => {
    const group = Object.entries(pageGroups).find(
      ([, definition]) => definition.label === item.label
    )?.[0];
    const added = pages.filter((page) => page.group === group);
    if (!item.children || !added.length) return item;

    return {
      ...item,
      children: [
        ...item.children,
        ...added.map((page) => ({ label: page.title, href: `/${page.route}` }))
      ]
    };
  });
}
