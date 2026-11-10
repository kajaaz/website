// Renders the Cloud Backend page with the private overview (src/private/, gitignored), encrypts that
// fragment with an access code and writes src/data/cloud-overview.enc.json, the only committed form.
// Usage: npm run encrypt:private   (asks for the code; ACCESS_CODE=... works for scripts)
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import readline from "node:readline";
import { gunzipSync, gzipSync } from "node:zlib";

const SOURCE = "src/private/CloudOverview.astro";
const TARGET = "src/data/cloud-overview.enc.json";
const OUT = ".private-build";
const ITERATIONS = 600_000;

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (!rl.muted) process.stdout.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    rl.muted = true;
  });
}

async function readCode() {
  if (process.env.ACCESS_CODE) return process.env.ACCESS_CODE;
  if (!process.stdin.isTTY) throw new Error("No terminal to ask for the code: set ACCESS_CODE.");
  const code = await askHidden("Access code: ");
  if ((await askHidden("Repeat it:   ")) !== code) throw new Error("The two codes differ.");
  return code;
}

if (!existsSync(SOURCE)) throw new Error(`${SOURCE} is missing: nothing to encrypt.`);
const code = await readCode();
if (code.length < 12) console.warn("Warning: short codes can be brute-forced offline; prefer a long passphrase.");

const build = spawnSync("npx", ["astro", "build", "--outDir", OUT], {
  stdio: "inherit",
  env: { ...process.env, RENDER_PRIVATE: "1" },
});
if (build.status !== 0) throw new Error("astro build failed");

try {
  const html = readFileSync(`${OUT}/cloud-backend/index.html`, "utf8");
  const start = html.indexOf("@@PRIVATE-START@@");
  const end = html.indexOf("@@PRIVATE-END@@");
  if (start < 0 || end < 0) throw new Error("Private markers not found: was the page built with RENDER_PRIVATE=1?");
  const fragment = html.slice(html.indexOf("</span>", start) + "</span>".length, html.lastIndexOf("<span", end)).trim();

  // Listed in clear so Tailwind generates the utilities that only the encrypted markup uses.
  const classes = [...new Set([...fragment.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)))]
    .filter(Boolean)
    .sort()
    .join(" ");

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, gzipSync(fragment, { level: 9 })));

  const roundTrip = gunzipSync(Buffer.from(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct))).toString();
  if (roundTrip !== fragment) throw new Error("Round trip failed");

  const b64 = (u8) => Buffer.from(u8).toString("base64");
  mkdirSync("src/data", { recursive: true });
  writeFileSync(
    TARGET,
    JSON.stringify({ kdf: "PBKDF2-SHA256", cipher: "AES-256-GCM", iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), classes, ct: b64(ct) }, null, 2) + "\n",
  );
  console.log(`\nWrote ${TARGET}: ${fragment.length} bytes of HTML, ${ct.length} bytes encrypted.`);
} finally {
  rmSync(OUT, { recursive: true, force: true });
}
