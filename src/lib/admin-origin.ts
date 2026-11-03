type AdminOriginEnvironment = {
  VERCEL?: string;
  BETTER_AUTH_URL?: string;
};

/** Page navigation only; authorization and mutation origin checks stay in auth.ts. */
export function canonicalAdminDestination(
  requestUrl: string,
  method: string,
  environment: AdminOriginEnvironment
): string | null {
  if (environment.VERCEL !== "1" || (method !== "GET" && method !== "HEAD")) {
    return null;
  }

  const configured = environment.BETTER_AUTH_URL?.trim();
  if (
    !configured ||
    !/^https:\/\//i.test(configured) ||
    /[\u0000-\u0020\u007f\\]/.test(configured)
  ) {
    return null;
  }

  try {
    const destination = new URL(configured);
    if (
      destination.protocol !== "https:" ||
      destination.username ||
      destination.password ||
      destination.pathname !== "/" ||
      destination.search ||
      destination.hash
    ) {
      return null;
    }

    const requested = new URL(requestUrl);
    if (
      (requested.protocol !== "https:" && requested.protocol !== "http:") ||
      requested.username ||
      requested.password ||
      (requested.pathname !== "/admin" &&
        !requested.pathname.startsWith("/admin/")) ||
      requested.origin === destination.origin
    ) {
      return null;
    }

    // Assign fields instead of resolving user input against the trusted origin.
    // Even query values or encoded path characters can never select another host.
    destination.pathname = requested.pathname;
    destination.search = requested.search;
    return destination.href;
  } catch {
    // Missing/malformed configuration must not break public pages or builds.
    return null;
  }
}
