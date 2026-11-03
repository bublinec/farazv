import { parseEditorAllowlist } from "../src/lib/auth-policy";
import { loadLocalEnvironment } from "./environment";
import { parseDatabaseUrl } from "./operations/lib";

loadLocalEnvironment();
const production =
  process.argv.includes("--production") ||
  process.env.VERCEL_ENV === "production";
const launch = process.argv.includes("--launch");
const checks: { name: string; valid: boolean }[] = [];
function check(name: string, valid: boolean) {
  checks.push({ name, valid });
}
function value(name: string) {
  return process.env[name]?.trim() ?? "";
}
function origin(name: string, httpsOnly: boolean) {
  try {
    const url = new URL(value(name));
    return (
      (url.protocol === "https:" ||
        (!httpsOnly &&
          url.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) &&
      url.pathname === "/" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}
function database(name: string, required: boolean) {
  if (!required && !value(name)) return true;
  try {
    const url = parseDatabaseUrl(value(name));
    return (
      !production ||
      (!/[\s]/.test(url.hostname) &&
        !["localhost", "127.0.0.1", "[::1]", ""].includes(url.hostname) &&
        ["require", "verify-ca", "verify-full"].includes(
          url.searchParams.get("sslmode") ?? ""
        ))
    );
  } catch {
    return false;
  }
}

check("CONTENT_SOURCE", value("CONTENT_SOURCE") === "database");
check("DATABASE_URL", database("DATABASE_URL", true));
check(
  "BACKUP_DATABASE_URL (optional direct connection)",
  database("BACKUP_DATABASE_URL", false)
);
check("SITE_URL", origin("SITE_URL", production));
check("BETTER_AUTH_URL", origin("BETTER_AUTH_URL", production));
check(
  "BETTER_AUTH_URL matches SITE_URL in production",
  !production ||
    value("BETTER_AUTH_URL").replace(/\/$/, "") ===
      value("SITE_URL").replace(/\/$/, "")
);
check("BETTER_AUTH_SECRET", value("BETTER_AUTH_SECRET").length >= 32);
check(
  "GOOGLE_CLIENT_ID",
  /^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(
    value("GOOGLE_CLIENT_ID")
  )
);
check("GOOGLE_CLIENT_SECRET", value("GOOGLE_CLIENT_SECRET").length >= 10);
const emails = value("ADMIN_EMAIL_ALLOWLIST")
  .split(/[,\n]/)
  .map((email) => email.trim())
  .filter(Boolean);
check(
  "ADMIN_EMAIL_ALLOWLIST",
  emails.length > 0 &&
    emails.every((email) => parseEditorAllowlist(email).size === 1)
);
check(
  "CLOUDINARY_CLOUD_NAME",
  /^[a-zA-Z0-9_-]+$/.test(value("CLOUDINARY_CLOUD_NAME"))
);
check("CLOUDINARY_API_KEY", /^\d+$/.test(value("CLOUDINARY_API_KEY")));
check("CLOUDINARY_API_SECRET", value("CLOUDINARY_API_SECRET").length >= 8);
check(
  "PREVIEW_DATE absent in production",
  !production || !value("PREVIEW_DATE")
);
check(
  "SITE_INDEXING_ENABLED",
  launch
    ? production && value("SITE_INDEXING_ENABLED") === "true"
    : value("SITE_INDEXING_ENABLED") !== "true"
);
check(
  "No public secret variables",
  !Object.keys(process.env).some(
    (name) =>
      name.startsWith("NEXT_PUBLIC_") &&
      /SECRET|PASSWORD|DATABASE_URL|API_KEY|TOKEN/.test(name)
  )
);
for (const result of checks)
  console.log(`${result.valid ? "PASS" : "INVALID/MISSING"} ${result.name}`);
console.log(
  "Checks validate configuration shape only. Verify Google sign-in and one real Cloudinary upload on the fixed staging domain before release."
);
if (checks.some((result) => !result.valid)) process.exitCode = 1;
