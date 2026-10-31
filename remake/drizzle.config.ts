import { loadLocalEnvironment } from "./scripts/environment";
import { defineConfig } from "drizzle-kit";
loadLocalEnvironment();
export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true
});
