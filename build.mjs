import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("./main.ts", import.meta.url), "utf8");
const banner = [
  "/*",
  " * Full File Extensions 1.1.3",
  " * Generated from main.ts with no external build dependencies.",
  " */",
  "",
].join("\n");

await writeFile(new URL("./main.js", import.meta.url), banner + source, "utf8");
