export interface Trait {
  id: string;
  name: string;
  description: string;
  color: string;
  languages: string[];
}

export const TRAITS: Trait[] = [
  // ── Memory management ──────────────────────────────────────────────
  {
    id: "gc",
    name: "Garbage collected",
    description:
      "The runtime automatically reclaims memory you are no longer using, so you never have to call free() or worry about memory leaks. The trade-off is occasional pauses while the collector runs.",
    color: "#059669",
    languages: [
      "Java", "C#", "Kotlin", "Scala", "Clojure", "Groovy", "Go", "Python",
      "JavaScript", "TypeScript", "Ruby", "PHP", "Lua", "R", "Haskell",
      "OCaml", "F#", "Erlang", "Elixir", "Gleam", "Lisp", "Scheme", "Racket",
      "Smalltalk", "Julia",
    ],
  },
  {
    id: "manual-memory",
    name: "Manual memory",
    description:
      "You allocate and free memory yourself (malloc/free, new/delete). This gives maximum control and predictable performance, but one mistake can cause crashes, leaks, or security vulnerabilities.",
    color: "#9F1239",
    languages: ["C", "C++", "Fortran", "Pascal", "Ada", "Zig", "Forth"],
  },
  {
    id: "ownership",
    name: "Ownership & affine types",
    description:
      "The compiler tracks who 'owns' each piece of data and ensures it is freed exactly once. You get memory safety without a garbage collector, at the cost of stricter rules about how you pass data around.",
    color: "#D97706",
    languages: ["Rust", "Move", "Cairo 1"],
  },

  // ── Type systems ───────────────────────────────────────────────────
  {
    id: "static-typing",
    name: "Statically typed",
    description:
      "Every variable has a type known at compile time. The compiler catches type errors before your program ever runs, which helps prevent bugs in large codebases.",
    color: "#0EA5E9",
    languages: [
      "C", "C++", "C#", "Java", "Kotlin", "Scala", "Go", "Rust", "Swift",
      "TypeScript", "Haskell", "OCaml", "F#", "Standard ML", "Ada", "Zig",
      "Nim", "D", "Crystal", "Elm", "PureScript", "Gleam", "Solidity",
    ],
  },
  {
    id: "dynamic-typing",
    name: "Dynamically typed",
    description:
      "Variables can hold any type, and type errors only appear when the code actually executes. This makes prototyping fast and code concise, but bugs can hide until a specific code path is hit at runtime.",
    color: "#8B5CF6",
    languages: [
      "Python", "JavaScript", "Ruby", "PHP", "Lua", "R", "Perl", "Lisp",
      "Common Lisp", "Scheme", "Racket", "Clojure", "Erlang", "Elixir",
      "Smalltalk",
    ],
  },
  {
    id: "null-safety",
    name: "Null safety",
    description:
      "The type system prevents null-pointer errors at compile time, usually via Option/Maybe types. Instead of crashing with 'null reference', the compiler forces you to handle the 'no value' case explicitly.",
    color: "#0F766E",
    languages: [
      "Rust", "Kotlin", "Swift", "TypeScript", "F#", "OCaml", "Haskell",
      "Elm", "Gleam",
    ],
  },
  {
    id: "generics",
    name: "Parametric polymorphism",
    description:
      "Write a single function or data structure that works with many types (like List<T>). The compiler generates specialised code for each type you use, without you copying and pasting.",
    color: "#DC2626",
    languages: [
      "C++", "Java", "C#", "Kotlin", "Scala", "Go", "Rust", "Swift",
      "TypeScript", "Haskell", "OCaml", "F#", "Standard ML", "Ada", "D", "Nim",
    ],
  },
  {
    id: "hm-inference",
    name: "Hindley-Milner inference",
    description:
      "The compiler figures out types automatically, without you writing annotations, using an algorithm from the ML family. You get the safety of static types with the feel of a dynamically typed language.",
    color: "#65A30D",
    languages: [
      "ML", "Standard ML", "Caml", "OCaml", "F#", "Haskell", "Elm",
      "PureScript", "Miranda", "Clean",
    ],
  },
  {
    id: "dependent-types",
    name: "Dependent types",
    description:
      "Types can depend on values: for example, 'a list of exactly 5 integers' or 'a sorted array'. This lets you express program properties as types and mathematically prove they hold.",
    color: "#6D28D9",
    languages: [
      "Coq", "Lean", "Lean 4", "Agda", "Idris", "F*", "Twelf", "Isabelle",
      "Dafny", "Rocq",
    ],
  },

  // ── Functional programming features ────────────────────────────────
  {
    id: "first-class-fns",
    name: "First-class functions",
    description:
      "Functions are values: you can store them in variables, pass them as arguments, and return them from other functions. This is the foundation of functional programming and enables patterns like map/filter/reduce.",
    color: "#2563EB",
    languages: [
      "JavaScript", "TypeScript", "Python", "Ruby", "Lua", "R", "Perl",
      "Swift", "Kotlin", "Scala", "Go", "Rust", "C#", "Haskell", "OCaml",
      "F#", "Elixir", "Erlang", "Clojure", "Lisp", "Scheme", "Racket",
      "Smalltalk", "Julia",
    ],
  },
  {
    id: "adts",
    name: "ADTs & pattern matching",
    description:
      "Data is modelled as tagged unions (sum types) and records (product types). Pattern matching lets you destructure values by shape, like a powerful switch/case that the compiler checks for completeness.",
    color: "#0D9488",
    languages: [
      "Haskell", "OCaml", "F#", "Standard ML", "Elm", "PureScript", "Rust",
      "Scala", "Swift", "Elixir", "Erlang", "Gleam", "Miranda", "Clean",
    ],
  },
  {
    id: "monads",
    name: "Monads / typed effects",
    description:
      "Side effects (I/O, errors, state) are wrapped in special types that the compiler tracks. This makes it explicit where effects happen, so pure functions stay pure and bugs from hidden side effects are eliminated.",
    color: "#7C3AED",
    languages: ["Haskell", "PureScript", "F#", "Scala", "Idris", "Elm", "Clean"],
  },
  {
    id: "immutability",
    name: "Immutable by default",
    description:
      "Values cannot be changed after creation. To 'update' something you create a new copy. This eliminates a whole class of bugs around shared mutable state and makes concurrent code much safer.",
    color: "#0891B2",
    languages: [
      "Haskell", "Elm", "PureScript", "Clojure", "Erlang", "Elixir", "Gleam",
      "Rust", "OCaml", "Clean",
    ],
  },
  {
    id: "lazy",
    name: "Lazy evaluation",
    description:
      "Expressions are not computed until their result is actually needed. This lets you work with infinite data structures (like an infinite list of primes) and skip unnecessary work, though it can make performance harder to predict.",
    color: "#C026D3",
    languages: ["Haskell", "Miranda", "Clean"],
  },
  {
    id: "homoiconic",
    name: "Homoiconic macros",
    description:
      "Code and data share the same structure (usually nested lists). Programs can inspect and rewrite their own source code at compile time using macros, enabling powerful metaprogramming that other languages cannot express.",
    color: "#9333EA",
    languages: [
      "Lisp", "Common Lisp", "Scheme", "Racket", "Clojure", "Elixir", "Julia",
    ],
  },

  // ── Concurrency: how tasks coordinate ──────────────────────────────
  // These three traits describe the *model* of coordination and are largely
  // mutually exclusive, so a language usually lights up under one of them.
  {
    id: "async-await",
    name: "Async / await",
    description:
      "The language has explicit async/await syntax: functions are marked async, and await suspends them at I/O points so other tasks can run. The scheduler may be single-threaded (JS, Python) or multi-threaded (Rust Tokio, C# ThreadPool, Kotlin coroutines). Go is NOT here because goroutines already make all code implicitly non-blocking: you write synchronous-looking code and the runtime handles scheduling, so async/await syntax is unnecessary.",
    color: "#E11D48",
    languages: [
      "JavaScript", "TypeScript", "Python", "C#", "Rust", "Kotlin", "Swift",
      "F#", "Dart",
    ],
  },
  {
    id: "actors",
    name: "Actor model: message passing",
    description:
      "Each actor (process) has its own private heap and no shared memory at all; the only way to interact is to send an asynchronous message to another actor's mailbox. This removes data races and locks entirely and underpins 'let it crash' fault-tolerant supervision.",
    color: "#DB2777",
    languages: ["Erlang", "Elixir", "Gleam"],
  },
  {
    id: "green-threads",
    name: "Lightweight concurrency",
    description:
      "The runtime multiplexes many user-space tasks (goroutines, BEAM processes, virtual threads) onto a small pool of OS threads. Because each task has a tiny growable stack instead of a fixed ~1 MB OS-thread stack, a process can hold hundreds of thousands or millions of them. This is a property of the scheduler, independent of how tasks coordinate (channels, actors, or shared memory).",
    color: "#15803D",
    languages: ["Go", "Erlang", "Elixir", "Gleam", "Haskell", "Java", "Kotlin"],
  },

  // ── Compilation & runtime ──────────────────────────────────────────
  {
    id: "native",
    name: "Compiled to native",
    description:
      "The compiler produces machine code directly, with no VM or interpreter at runtime. This gives maximum performance and small standalone binaries that run anywhere without installing a runtime.",
    color: "#B45309",
    languages: [
      "C", "C++", "Rust", "Go", "Zig", "Swift", "Fortran", "Ada", "Pascal",
      "Haskell", "OCaml", "Nim", "D", "Crystal",
    ],
  },
  {
    id: "managed-vm",
    name: "Runs on a managed VM",
    description:
      "Code runs on a virtual machine (JVM, BEAM, CLR) that handles memory, security, and portability. You write once and run on any platform that has the VM, and you get features like hot code reloading for free.",
    color: "#F59E0B",
    languages: [
      "Java", "Kotlin", "Scala", "Groovy", "Clojure", "C#", "F#",
      "Visual Basic", "Erlang", "Elixir", "Gleam",
    ],
  },
  {
    id: "jit",
    name: "JIT-compiled",
    description:
      "A Just-In-Time compiler translates code to machine instructions while the program runs. It watches which code paths are 'hot' and optimises them aggressively, giving scripting-like convenience with near-native speed.",
    color: "#4338CA",
    languages: [
      "Java", "C#", "JavaScript", "TypeScript", "Julia", "Erlang", "Elixir",
    ],
  },
  {
    id: "interpreted",
    name: "Interpreted / scripting",
    description:
      "No separate compile step: you write a file and run it directly. The interpreter reads and executes your code line by line (some use a bytecode VM internally). Development is fast, but execution is typically slower than compiled languages.",
    color: "#EA580C",
    languages: [
      "Python", "Ruby", "PHP", "Lua", "R", "Perl", "sh",
    ],
  },
];
