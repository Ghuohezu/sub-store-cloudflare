import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { denyPatterns, skippedCurrentFiles } from "./open-source-denylist.mjs";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter((file) => !skippedCurrentFiles.has(file))
  .filter((file) => existsSync(file));

const findings = [];

for (const file of trackedFiles) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const [pattern, label] of denyPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        findings.push(`${file}:${index + 1}: ${label}: ${line.trim()}`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("Open-source scan passed.");
