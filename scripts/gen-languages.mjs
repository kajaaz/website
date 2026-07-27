import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CSV = join(ROOT, "public", "languages.csv");
const OUT = join(ROOT, "src", "content", "languages");

const BAND_MAP = {
  "imperative-procedural": "imperative-procedural",
  "imperative-oo": "object-oriented",
  "multi-paradigm": "multi-paradigm",
  "functional-impure": "functional-impure",
  "functional-pure": "functional-pure",
  "logic-declarative": "logic-relational",
  "dependent-proof": "dependently-typed",
};

const SLUG_OVERRIDES = {
  "C++": "cpp",
  "C#": "csharp",
  "F#": "fsharp",
  "F*": "fstar",
  "PL/I": "pl1",
  "TLA+": "tlaplus",
  "Lean 4": "lean4",
};

function slugify(name) {
  if (SLUG_OVERRIDES[name]) return SLUG_OVERRIDES[name];
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

// Collect names already present so we never clobber the hand-authored entries.
const existingNames = new Set();
for (const f of readdirSync(OUT).filter((f) => f.endsWith(".json"))) {
  try {
    const data = JSON.parse(readFileSync(join(OUT, f), "utf8"));
    if (data.name) existingNames.add(data.name);
  } catch {}
}

const lines = readFileSync(CSV, "utf8").trim().split("\n");
lines.shift(); // header

let created = 0;
for (const line of lines) {
  // year,name,band,note  — name/note never contain commas in this file except notes.
  const firstComma = line.indexOf(",");
  const year = Number(line.slice(0, firstComma));
  const rest = line.slice(firstComma + 1);
  const secondComma = rest.indexOf(",");
  const name = rest.slice(0, secondComma);
  const rest2 = rest.slice(secondComma + 1);
  const thirdComma = rest2.indexOf(",");
  const band = thirdComma === -1 ? rest2 : rest2.slice(0, thirdComma);
  const note = thirdComma === -1 ? "" : rest2.slice(thirdComma + 1);

  if (existingNames.has(name)) continue;

  const paradigm = BAND_MAP[band.trim()];
  if (!paradigm) {
    console.warn(`Unknown band "${band}" for ${name}`);
    continue;
  }

  const slug = slugify(name);
  const file = join(OUT, `${slug}.json`);
  if (existsSync(file)) {
    console.warn(`Skipping existing file for slug ${slug} (${name})`);
    continue;
  }

  const entry = { name, year, paradigm };
  if (note && note.trim()) entry.note = note.trim();

  writeFileSync(file, JSON.stringify(entry, null, 2) + "\n");
  created++;
}

console.log(`Created ${created} new language entries.`);
