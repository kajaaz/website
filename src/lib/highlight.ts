import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

const LANG_LIST: BundledLanguage[] = [
  "c",
  "go",
  "java",
  "kotlin",
  "python",
  "javascript",
  "rust",
  "typescript",
  "lisp",
  "erlang",
  "ocaml",
  "haskell",
  "prolog",
  "coq",
  "cpp",
  "csharp",
  "ruby",
  "php",
  "swift",
  "scala",
  "sql",
  "lua",
  "r",
  "bash",
];

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: LANG_LIST,
    });
  }
  return highlighterPromise;
}

export async function highlightCode(
  lang: string,
  source: string,
): Promise<string> {
  const highlighter = await getHighlighter();
  const loadedLangs = highlighter.getLoadedLanguages();
  const effectiveLang = loadedLangs.includes(lang) ? lang : "text";

  return highlighter.codeToHtml(source, {
    lang: effectiveLang,
    theme: "github-dark",
  });
}
