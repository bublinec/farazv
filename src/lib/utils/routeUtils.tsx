export const isExternal = (href: string) => {
  return href.includes("http") || href.includes("www");
};
