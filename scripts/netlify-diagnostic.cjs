const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

if (process.env.CONTEXT !== "deploy-preview") {
  throw new Error("This diagnostic command is restricted to deploy previews.");
}

const root = path.resolve(__dirname, "..");
const marker = fs.readFileSync(path.join(root, "static/deploy-check.txt"), "utf8");
const versions = {};
for (const name of ["gatsby", "gatsby-plugin-sharp", "gatsby-source-graphql", "react", "react-dom"]) {
  try {
    versions[name] = require(`${name}/package.json`).version;
  } catch {
    versions[name] = "not installed";
  }
}

let yarnVersion = "unavailable";
try {
  const output = execFileSync("yarn", ["--version"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
  if (/^\d+\.\d+\.\d+$/.test(output)) yarnVersion = output;
} catch {}

const result = {
  marker: marker.trim(),
  stage: "Dependency setup and the preview build command completed",
  node: process.version,
  yarn: yarnVersion,
  packages: versions
};
const outputDir = path.join(root, "diagnostic-public");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "deploy-check.txt"), marker);
fs.writeFileSync(path.join(outputDir, "diagnostic.json"), JSON.stringify(result, null, 2));
fs.writeFileSync(
  path.join(outputDir, "index.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Deployment diagnostic</title><h1>Deployment diagnostic</h1><p>This preview tests deployment setup. It is not the production site.</p><pre>' +
    JSON.stringify(result, null, 2).replace(/&/g, "&amp;").replace(/</g, "&lt;") +
    "</pre></html>"
);
console.log(JSON.stringify(result));
