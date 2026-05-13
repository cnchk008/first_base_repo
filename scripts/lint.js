import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url);
const checkedExtensions = new Set([".css", ".html", ".js", ".json", ".md"]);
const ignoredDirectories = new Set([".git", "node_modules"]);
const problems = [];

for (const file of await listFiles(root.pathname)) {
  if (!shouldCheck(file)) {
    continue;
  }

  const text = await readFile(file, "utf8");

  if (!text.endsWith("\n")) {
    problems.push(`${file}: missing final newline`);
  }

  text.split("\n").forEach((line, index) => {
    if (/\s+$/.test(line)) {
      problems.push(`${file}:${index + 1}: trailing whitespace`);
    }
  });
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Lint checks passed.");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldCheck(file) {
  return [...checkedExtensions].some((extension) => file.endsWith(extension));
}
