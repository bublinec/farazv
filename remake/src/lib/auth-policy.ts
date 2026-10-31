/** Shared, dependency-free policy. The signed session is verified on the server. */
export class AccessError extends Error {
  constructor(
    public readonly status: 401 | 403 | 503,
    message: string,
    public readonly code = "ACCESS_DENIED"
  ) {
    super(message);
    this.name = "AccessError";
  }
}

export function parseEditorAllowlist(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(/[,\n]/)
      .map((email) => email.trim().toLowerCase())
      .filter((email) => /^[^\s@*,]+@[^\s@*,]+\.[^\s@*,]+$/.test(email))
  );
}

export function isEditorEmail(
  email: unknown,
  allowlist = process.env.ADMIN_EMAIL_ALLOWLIST
): boolean {
  return (
    typeof email === "string" &&
    parseEditorAllowlist(allowlist).has(email.trim().toLowerCase())
  );
}

export interface EditorIdentity {
  email: string;
  name?: string;
}

export function assertEditorIdentity(
  session: {
    user?: { email?: unknown; emailVerified?: unknown; name?: unknown };
    session?: { expiresAt?: Date | string };
  } | null,
  allowlist = process.env.ADMIN_EMAIL_ALLOWLIST,
  now = Date.now()
): EditorIdentity {
  if (parseEditorAllowlist(allowlist).size === 0) {
    throw new AccessError(
      503,
      "Prístup do administrácie ešte nie je nastavený.",
      "AUTH_NOT_CONFIGURED"
    );
  }
  if (
    !session?.user ||
    !session.session?.expiresAt ||
    new Date(session.session.expiresAt).getTime() <= now ||
    !Number.isFinite(new Date(session.session.expiresAt).getTime())
  ) {
    throw new AccessError(
      401,
      "Prihláste sa do administrácie.",
      "AUTH_REQUIRED"
    );
  }
  if (
    session.user.emailVerified !== true ||
    !isEditorEmail(session.user.email, allowlist)
  ) {
    throw new AccessError(
      403,
      "Tento Google účet nemá prístup do administrácie.",
      "EDITOR_NOT_ALLOWED"
    );
  }
  return {
    email: (session.user.email as string).trim().toLowerCase(),
    ...(typeof session.user.name === "string"
      ? { name: session.user.name }
      : {})
  };
}

export function assertSameOrigin(
  request: Request,
  expectedOrigin: string
): void {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return;
  const origin = request.headers.get("origin");
  // Missing/opaque origins are rejected too: all editor writes use same-origin fetch.
  if (
    origin !== expectedOrigin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    throw new AccessError(
      403,
      "Požiadavka musí pochádzať z tejto stránky.",
      "INVALID_ORIGIN"
    );
  }
}
