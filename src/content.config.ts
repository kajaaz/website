import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const paradigm = z.enum([
  "dependently-typed",
  "logic-relational",
  "functional-pure",
  "functional-impure",
  "multi-paradigm",
  "object-oriented",
  "imperative-procedural",
]);

const codeExample = z.object({
  lang: z.string(),
  source: z.string(),
  // Optional one-line label shown above the snippet.
  caption: z.string().optional(),
});

const runtimeKind = z.enum([
  "native",
  "jit",
  "bytecode-vm",
  "interpreter",
  "wasm",
  "transpile",
]);

const languages = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/languages" }),
  schema: z.object({
    name: z.string(),
    year: z.number().int().min(1940).max(2030),
    paradigm: paradigm,
    // Short one-line description shown in the detail panel. Every entry has this.
    note: z.string().optional(),
    // Rich detail fields. Present for the well-known languages; optional for the
    // long historical tail so the timeline can stay complete without inventing
    // dubious specifics for every entry.
    typeSystem: z.string().optional(),
    // Snippet that illustrates the type system (generics, inference, ownership...).
    typeSystemExample: codeExample.optional(),
    // Legacy single-line runtime summary. `runtimes` supersedes it when present.
    runtime: z.string().optional(),
    // A language can target several runtimes; each has an execution kind + role.
    runtimes: z
      .array(
        z.object({
          name: z.string(),
          kind: runtimeKind,
          role: z.string(),
        }),
      )
      .optional(),
    // Known compilers / toolchains and what each one is for.
    compilers: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
        }),
      )
      .optional(),
    // Pluggable async executors (Rust: Tokio/smol/embassy; Python: asyncio/uvloop).
    asyncRuntimes: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
        }),
      )
      .optional(),
    concurrencyModel: z.string().optional(),
    // Snippet that illustrates the concurrency model.
    concurrencyExample: codeExample.optional(),
    // General idiomatic snippet.
    codeExample: codeExample.optional(),
  }),
});

export const collections = { languages };
