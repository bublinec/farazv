import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));

/** Process variables win over local secrets, which win over defaults. */
export function loadLocalEnvironment(directory = projectRoot) {
  config({ path: path.join(directory, ".env.local"), quiet: true });
  config({ path: path.join(directory, ".env"), quiet: true });
}
