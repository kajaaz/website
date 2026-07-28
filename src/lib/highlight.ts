import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

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
    // Use the pure-JS RegExp engine instead of the default oniguruma WASM
    // engine. The WASM engine intermittently crashes with "memory access out
    // of bounds" when many large grammars (C++, Lisp, ...) are re-highlighted
    // on every dev HMR reload. `forgiving` skips any TextMate rule the JS
    // engine cannot translate rather than throwing.
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: LANG_LIST,
      engine: createJavaScriptRegexEngine({ forgiving: true }),
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
