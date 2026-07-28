// Shared vocabulary for how a language actually executes. Keeping this as a
// small fixed enum lets us compare runtimes both within a language (Rust can be
// native, wasm, or interpreted) and across languages (is this JIT or AOT?).
// Colours are aligned with the matching entries in src/lib/traits.ts.
export const RUNTIME_KINDS: Record<
  string,
  { label: string; color: string }
> = {
  native: { label: "Native", color: "#16653a" },
  jit: { label: "JIT", color: "#4338CA" },
  "bytecode-vm": { label: "Bytecode VM", color: "#B45309" },
  interpreter: { label: "Interpreter", color: "#be185d" },
  wasm: { label: "WebAssembly", color: "#7C3AED" },
  transpile: { label: "Transpiler", color: "#0891B2" },
};

export type RuntimeKind = keyof typeof RUNTIME_KINDS;
