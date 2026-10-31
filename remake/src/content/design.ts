export type PublicDesign = "current" | "parish";

export const DESIGN_COOKIE = "farazv-design-preview";

/** Review variants are opt-in and never selected on a production deployment. */
export function resolvePublicDesign(
  value: string | undefined,
  vercelEnvironment?: string
): PublicDesign {
  return vercelEnvironment !== "production" && value === "parish"
    ? "parish"
    : "current";
}

export function designReturnPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/";
  const url = new URL(value, "https://design-preview.invalid");
  if (
    url.origin !== "https://design-preview.invalid" ||
    /^\/(admin|api|design)(\/|$)/.test(url.pathname)
  )
    return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
