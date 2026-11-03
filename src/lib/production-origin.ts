type ProductionOriginEnvironment = {
  VERCEL?: string;
  VERCEL_ENV?: string;
  SITE_URL?: string;
};

/** Keep preview URLs usable; consolidate only public production page navigation. */
export function productionPageDestination(
  requestUrl: string,
  method: string,
  environment: ProductionOriginEnvironment
): string | null {
  if (
    environment.VERCEL !== "1" ||
    environment.VERCEL_ENV !== "production" ||
    !["GET", "HEAD"].includes(method)
  )
    return null;
  const configured = environment.SITE_URL?.trim();
  if (!configured || /[\u0000-\u0020\u007f\\]/.test(configured)) return null;

  try {
    const destination = new URL(configured);
    const requested = new URL(requestUrl);
    if (
      destination.protocol !== "https:" ||
      destination.username ||
      destination.password ||
      destination.pathname !== "/" ||
      destination.search ||
      destination.hash ||
      !["http:", "https:"].includes(requested.protocol) ||
      requested.username ||
      requested.password ||
      /^\/(?:api|admin|_next)(?:\/|$)/.test(requested.pathname) ||
      requested.origin === destination.origin
    )
      return null;

    destination.pathname = requested.pathname;
    destination.search = requested.search;
    return destination.href;
  } catch {
    return null;
  }
}
