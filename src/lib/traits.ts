export interface Trait {
  id: string;
  name: string;
  description: string;
  color: string;
  languages: string[];
}

// Ordered alphabetically by name.
export const TRAITS: Trait[] = [
  {
    id: "actors",
    name: "Actor model: message passing",
    description:
      "The BEAM ecosystem supports lightweight actors with isolated process state and asynchronous mailboxes, commonly combined with links and supervision. Most ordinary messages are copied, while runtime facilities such as shared binaries or ETS mean isolation is not literally an absence of all shared memory.",
    color: "#DB2777",
    languages: ["Erlang", "Elixir", "Gleam"],
  },
  {
    id: "adts",
    name: "ADTs & pattern matching",
    description:
      "The language provides algebraic or inductive data types, such as tagged unions and product types, together with pattern matching or case analysis. Static systems can often diagnose missing cases, although the strength of exhaustiveness checking varies.",
    color: "#0D9488",
    languages: [
      "Haskell", "OCaml", "F#", "Standard ML", "Elm", "PureScript", "Rust",
      "Scala", "Swift", "Gleam", "Miranda", "Clean",
      "ML", "Caml", "Idris", "Agda", "Lean", "Lean 4", "Coq", "F*",
      "Mercury", "Kotlin", "TypeScript", "Zig", "Rocq", "Dafny", "Why3",
      "PVS", "Isabelle", "HOL",
    ],
  },
  {
    id: "async-await",
    name: "Async / await",
    description:
      "The language has explicit async/await syntax or equivalent built-in forms: an async computation can suspend at await points while other work proceeds. Execution may use an event loop, thread pool, or pluggable executor, and suspension does not by itself imply parallel execution.",
    color: "#E11D48",
    languages: [
      "JavaScript", "TypeScript", "Python", "C#", "Rust", "Swift",
    ],
  },
  {
    id: "native",
    name: "Compiled to native",
    description:
      "A major implementation can compile programs ahead of time to platform-native machine code. The resulting binary may still include or depend on a language runtime, garbage collector, system libraries, and a specific operating-system and processor ABI.",
    color: "#B45309",
    languages: [
      "C", "C++", "Rust", "Go", "Zig", "Swift", "Fortran", "Ada", "Pascal",
      "Haskell", "OCaml", "Nim", "D", "Crystal", "COBOL", "PL/I",
      "Objective-C", "Eiffel", "Delphi", "Simula 67", "Mercury", "Idris",
      "Lean 4", "ALGOL 58", "ALGOL 60", "ALGOL 68", "Common Lisp",
      "Standard ML", "Clean", "Carbon", "Mojo", "Racket",
    ],
  },
  {
    id: "dependent-types",
    name: "Dependent types",
    description:
      "Types can depend on values: for example, 'a list of exactly 5 integers' or 'a sorted array'. This lets you express program properties as types and mathematically prove they hold.",
    color: "#6D28D9",
    languages: [
      "Coq", "Lean", "Lean 4", "Agda", "Idris", "F*", "Twelf", "Rocq", "PVS",
      "Automath", "Nuprl",
    ],
  },
  {
    id: "dynamic-typing",
    name: "Dynamically typed",
    description:
      "Values carry runtime types and many type checks occur as operations execute rather than in a mandatory whole-program compile-time pass. This can support flexible, concise code, while some mismatches remain latent until the relevant path runs.",
    color: "#8B5CF6",
    languages: [
      "Python", "JavaScript", "Ruby", "PHP", "Lua", "R", "Perl", "Lisp",
      "Common Lisp", "Scheme", "Racket", "Clojure", "Erlang", "Elixir",
      "Smalltalk", "Prolog", "Julia", "Groovy", "Wolfram Language", "APL",
      "AWK", "Self", "Logo", "SASL", "BASIC", "Oz",
    ],
  },
  {
    id: "first-class-fns",
    name: "First-class functions",
    description:
      "The language supports callable values (direct functions, closures, delegates, blocks, or functional-interface objects) that can be stored, passed, and returned. The exact representation differs, but it enables higher-order patterns such as map, filter, and reduce.",
    color: "#2563EB",
    languages: [
      "JavaScript", "TypeScript", "Python", "Ruby", "Lua", "R", "Perl",
      "Swift", "Kotlin", "Scala", "Go", "Rust", "C#", "Haskell", "OCaml",
      "F#", "Elixir", "Erlang", "Clojure", "Lisp", "Scheme", "Racket",
      "Smalltalk", "Julia", "PHP", "Java", "C++", "Common Lisp",
      "Standard ML", "ML", "Caml", "Miranda", "Clean", "Groovy",
      "Wolfram Language", "Gleam", "PureScript", "Elm", "Idris", "Agda",
      "Lean", "Lean 4", "Coq", "Rocq", "F*", "Mercury", "Logo", "Dafny",
      "Why3", "PVS", "D", "Nim", "Crystal", "Objective-C", "Self", "APL",
    ],
  },
  {
    id: "gc",
    name: "Garbage collected",
    description:
      "The runtime automatically reclaims at least some unreachable memory, using tracing, reference counting, cycle collection, or a combination. This removes most explicit deallocation, but logical leaks and implementation-dependent collection overhead or pauses are still possible.",
    color: "#059669",
    languages: [
      "Java", "C#", "Kotlin", "Scala", "Clojure", "Groovy", "Go", "Python",
      "JavaScript", "TypeScript", "Ruby", "PHP", "Lua", "R", "Haskell",
      "OCaml", "F#", "Erlang", "Elixir", "Gleam", "Lisp", "Scheme", "Racket",
      "Smalltalk", "Julia", "Common Lisp", "Standard ML", "ML", "Caml",
      "Miranda", "Clean", "Elm", "PureScript", "Mercury", "Prolog",
      "Wolfram Language", "Idris", "Agda", "Coq", "Rocq", "Lean", "Lean 4",
      "F*", "D", "Nim", "Crystal", "Visual Basic", "Self", "Logo", "Dafny",
      "Eiffel", "HOL", "Isabelle", "PVS", "Nuprl", "ACL2", "LCF", "Twelf",
      "Simula 67", "Perl", "Oz",
    ],
  },
  {
    id: "hm-inference",
    name: "Hindley-Milner inference",
    description:
      "An ML-family inference system derives many types without annotations and generalises eligible bindings polymorphically. Listed languages may extend or restrict classic Hindley-Milner with features such as type classes, rows, subtyping, or platform interoperability.",
    color: "#65A30D",
    languages: [
      "ML", "Standard ML", "Caml", "OCaml", "F#", "Haskell", "Elm",
      "PureScript", "Miranda", "Clean",
    ],
  },
  {
    id: "homoiconic",
    name: "Homoiconic macros",
    description:
      "Code has a language-level data representation, such as lists, terms, symbolic expressions, or AST objects, that programs and macros can inspect and transform. Quoting, expansion phase, hygiene, and evaluation rules differ between languages.",
    color: "#9333EA",
    languages: [
      "Lisp", "Common Lisp", "Scheme", "Racket", "Clojure", "Elixir", "Julia",
      "Logo", "Prolog", "R", "Wolfram Language",
    ],
  },
  {
    id: "immutability",
    name: "Immutable by default",
    description:
      "Bindings or commonly used data structures are immutable by default, so updates often produce new values. Some listed languages still provide explicit mutable references, arrays, fields, variables, or controlled interior mutation.",
    color: "#0891B2",
    languages: [
      "Haskell", "Elm", "PureScript", "Clojure", "Erlang", "Elixir", "Gleam",
      "Rust", "OCaml", "Clean", "F#", "Idris", "Agda", "Lean", "Lean 4",
      "Coq", "F*", "Miranda", "Standard ML", "ML", "Caml", "Mercury",
      "Datalog",
    ],
  },
  {
    id: "interpreted",
    name: "Interpreted (compiler in the runtime)",
    description:
      "A major implementation runs source directly, with no separate build step, because the compiler ships as a library inside the runtime: it loads the source, compiles it to bytecode and/or machine code on the fly, and executes it in the same process. This runtime-hosted compiler is the hallmark of a dynamic language, as opposed to an ahead-of-time toolchain that produces a standalone binary.",
    color: "#EA580C",
    languages: [
      "Python", "Ruby", "PHP", "Lua", "R", "Perl", "Wolfram Language",
      "APL", "BASIC", "Forth", "JavaScript", "SQL",
    ],
  },
  {
    id: "jit",
    name: "JIT-compiled",
    description:
      "A major implementation translates source, bytecode, or emitted code to native instructions during execution or module loading. Some JITs optimise frequently executed paths adaptively; others perform non-adaptive load-time compilation.",
    color: "#4338CA",
    languages: [
      "Java", "C#", "JavaScript", "TypeScript", "Julia", "Erlang", "Elixir",
      "Kotlin", "Scala", "Groovy", "Clojure", "Gleam", "PHP", "F#",
      "Visual Basic", "Self", "Smalltalk", "Ruby", "Lua",
    ],
  },
  {
    id: "lazy",
    name: "Lazy evaluation",
    description:
      "The language uses call-by-need broadly or delays important constructs such as function arguments until their values are demanded. Laziness can support infinite data and avoid unused work, but its scope and performance effects vary by language.",
    color: "#C026D3",
    languages: ["Haskell", "Miranda", "Clean", "SASL", "R"],
  },
  {
    id: "green-threads",
    name: "Lightweight concurrency",
    description:
      "Major runtimes or libraries can multiplex many lightweight tasks, such as goroutines, BEAM processes, coroutines, or virtual threads, over operating-system threads. Their stacks or suspended state are represented differently, and capacity and scheduling behavior depend on the implementation and workload.",
    color: "#15803D",
    languages: ["Go", "Erlang", "Elixir", "Gleam", "Haskell", "Java", "Kotlin"],
  },
  {
    id: "manual-memory",
    name: "Manual memory",
    description:
      "The language supports explicit allocation and deallocation, such as malloc/free, new/delete, storage pools, or equivalent facilities. Idiomatic programs may also use scopes, RAII, or managed types, but incorrect manual lifetime handling can cause leaks, crashes, or security vulnerabilities.",
    color: "#9F1239",
    languages: [
      "C", "C++", "Fortran", "Pascal", "Ada", "Zig", "Forth", "COBOL",
      "PL/I", "Delphi",
    ],
  },
  {
    id: "monads",
    name: "Monads / typed effects",
    description:
      "The language uses monadic interfaces, effect types, managed commands, or uniqueness/world types to represent at least some effects explicitly. Coverage varies by language, and these abstractions improve composition and reasoning without eliminating effect-related bugs.",
    color: "#7C3AED",
    languages: ["Haskell", "PureScript", "Idris", "Elm", "Clean", "F*", "Lean 4"],
  },
  {
    id: "null-safety",
    name: "Null safety",
    description:
      "The type system distinguishes potentially absent values, often through Option/Maybe or nullable types, and requires many uses to handle that case explicitly. Configuration, interoperability, assertions, or unsafe escape hatches may still permit null-related runtime failures.",
    color: "#0F766E",
    languages: [
      "Rust", "Kotlin", "Swift", "TypeScript", "F#", "OCaml", "Haskell",
      "Elm", "Gleam", "PureScript",
    ],
  },
  {
    id: "ownership",
    name: "Ownership & affine types",
    description:
      "The type system restricts how values or resources are copied, moved, borrowed, dropped, or destroyed. Depending on the language, this can enforce memory safety, resource discipline, or VM invariants without requiring every value to be managed by a tracing garbage collector.",
    color: "#D97706",
    languages: ["Rust", "Move", "Cairo 1"],
  },
  {
    id: "generics",
    name: "Parametric polymorphism",
    description:
      "A function or data structure can be parameterised over types, such as List<T>, without duplicating its source. Implementations may erase parameters, share runtime code, pass type information through dictionaries, or generate specialised code.",
    color: "#DC2626",
    languages: [
      "C++", "Java", "C#", "Kotlin", "Scala", "Go", "Rust", "Swift",
      "TypeScript", "Haskell", "OCaml", "F#", "Standard ML", "Ada", "D", "Nim",
      "ML", "Caml", "Miranda", "Clean", "Eiffel", "Crystal", "PureScript",
      "Elm", "Mercury", "Move", "Cairo 1", "Zig", "Julia", "Gleam",
    ],
  },
  {
    id: "managed-vm",
    name: "Runs on a managed VM",
    description:
      "A major implementation runs compiled code on a managed virtual machine such as the JVM, CLR, or BEAM. The VM commonly supplies automatic memory management, portability services, and runtime tooling, while deployment behavior and features vary by platform.",
    color: "#F59E0B",
    languages: [
      "Java", "Kotlin", "Scala", "Groovy", "Clojure", "C#", "F#",
      "Visual Basic", "Erlang", "Elixir", "Gleam",
    ],
  },
  {
    id: "scripting",
    name: "Scripting (glue / automation)",
    description:
      "Designed to orchestrate other programs and automate tasks (running commands, moving files, wiring pipelines) rather than to build large standalone applications. A classic shell is read and executed command by command, with no compiler producing a program ahead of time. Embeddable dynamic languages such as Lua sit on the border: widely used for scripting, but backed by a real bytecode compiler in their runtime.",
    color: "#78716C",
    languages: ["sh", "AWK", "Lua", "Perl"],
  },
  {
    id: "static-typing",
    name: "Statically typed",
    description:
      "The language checks declared or inferred type constraints before execution. Gradual and dynamically extensible systems may retain escape hatches or defer some checks, but static checking can catch many mismatches before affected code runs.",
    color: "#0EA5E9",
    languages: [
      "C", "C++", "C#", "Java", "Kotlin", "Scala", "Go", "Rust", "Swift",
      "TypeScript", "Haskell", "OCaml", "F#", "Standard ML", "Ada", "Zig",
      "Nim", "D", "Crystal", "Elm", "PureScript", "Gleam", "Solidity",
      "Fortran", "COBOL", "Pascal", "Mercury", "Caml", "ML", "Simula 67",
      "Eiffel", "Delphi", "Idris", "Agda", "Coq", "Rocq", "Lean", "Lean 4",
      "F*", "PL/I", "Move", "Cairo 1", "Vyper", "Leo", "Noir", "Michelson",
      "Dafny", "Why3", "Objective-C", "ALGOL 60", "ALGOL 68", "ALGOL 58",
      "Mojo", "Carbon", "Miranda", "Clean", "HOL", "Isabelle", "PVS", "Alloy",
      "Nuprl", "LCF", "Twelf", "Automath",
    ],
  },
];
