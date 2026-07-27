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
    runtime: z.string().optional(),
    concurrencyModel: z.string().optional(),
    codeExample: z
      .object({
        lang: z.string(),
        source: z.string(),
      })
      .optional(),
  }),
});

export const collections = { languages };
