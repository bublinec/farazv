export const isExternal = (href: string) => {
  return (
    href.includes("http") ||
    href.includes("www") ||
    href.includes("tel:") ||
    href.includes("mailto:")
  );
};
