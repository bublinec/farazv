export const isExternal = (href: string) => {
  console.log(href, href.includes("tel:"));
  return (
    href.includes("http") ||
    href.includes("www") ||
    href.includes("tel:") ||
    href.includes("mailto:")
  );
};
