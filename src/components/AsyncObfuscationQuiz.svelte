<script lang="ts">
  interface Question {
    level: "medium" | "hard";
    topic: string;
    prompt: string; // HTML
    hint: string; // HTML
    code?: string; // plain text
    options: string[]; // HTML
    correct: number;
    explain: string; // HTML
  }

  const QUESTIONS: Question[] = [
    // ---------- MEDIUM ----------
    {
      level: "medium",
      topic: "control-flow flattening",
      prompt:
        "A reverse engineer opens an <code>async fn</code> in a decompiler and sees one big <code>loop { match state { ... } }</code> instead of the original <code>if</code>/<code>await</code> sequence. Which classic obfuscation does the compiler's output most resemble?",
      hint: "Think about what the original branches and straight-line calls got turned into: a single dispatch driven by a variable.",
      options: [
        "String encryption.",
        "Control-flow flattening: the original structured control flow becomes a dispatch on a state discriminant.",
        "Dead-code insertion.",
        "Symbol stripping.",
      ],
      correct: 1,
      explain:
        "<code>async fn</code> compiles to a state machine: each <code>.await</code> is a resume point, and <code>poll</code> becomes a dispatch on a discriminant that advances from one state to the next. The original ordering and branching no longer appear as nested blocks; they are reconstructed at runtime from the state field. That is structurally the same transform obfuscators like OLLVM apply deliberately as control-flow flattening, except here <code>rustc</code> does it as a side effect of lowering async.",
    },
    {
      level: "medium",
      topic: "locals as fields",
      prompt:
        "Why can a value held across an <code>.await</code> be harder to recover than an ordinary local when reading a crash dump or stepping in a debugger?",
      hint: "Where does a value that must survive a suspension point actually get stored?",
      options: [
        "It is encrypted in place by the runtime.",
        "It is stored in a field of the future struct, valid only in certain states, rather than at a fixed stack-frame offset.",
        "It is always moved to a CPU register that debuggers cannot read.",
        "It is duplicated into every state to confuse analysis.",
      ],
      correct: 1,
      explain:
        "Any local that is live across an <code>.await</code> cannot stay on the call stack, because the frame is unwound when the task suspends. The compiler promotes it into a field of the generated future. So it lives at an offset inside that struct (often heap-allocated behind <code>Box::pin</code>), and whether that field even holds a valid value depends on the current discriminant. A tool expecting a normal stack layout has to first recover the state machine's shape and current state.",
    },
    {
      level: "medium",
      topic: "call-graph erasure",
      prompt:
        "You chain <code>a().await</code> inside <code>b().await</code> inside <code>c()</code>. Why does this tend to blur the call graph a static tool would normally recover?",
      hint: "Recall where an awaited inner future is physically stored relative to its parent.",
      options: [
        "Each await inserts a random indirect jump table.",
        "The inner futures are stored inline as fields of the outer future, so the separate async fns collapse into one flat state machine with no call boundary between them.",
        "The linker deletes the inner functions entirely.",
        "Async fns are compiled to separate dynamic libraries loaded at runtime.",
      ],
      correct: 1,
      explain:
        "An awaited inner future is embedded as a field of the parent's state machine, so a chain of <code>async fn</code>s flattens into a single nested struct that one <code>poll</code> drives. After inlining there may be no distinct call to <code>a</code> or <code>b</code> at all; their logic is interleaved into the outer <code>poll</code>'s dispatch. The clean one-node-per-function call graph a reverser expects simply is not there.",
    },

    {
      level: "medium",
      topic: "spot the dispatch",
      prompt:
        "Reading a release binary, you find this sequence, and most blocks of the function jump back to it. What is it most likely?",
      code: `movzx  eax, cl
movsxd rax, [r15+rax*4]
add    rax, r15
jmp    rax`,
      hint: "A table indexed by a variable, then an indirect jump, with back edges from every block. What source construct compiles to that?",
      options: [
        "A virtual call through a vtable, as in dynamic dispatch.",
        "A PLT stub resolving an imported function.",
        "A <code>switch</code> on a one-byte state variable compiled to a jump table: the dispatch of a flattened state machine, such as an async fn's <code>poll</code>.",
        "A stack-protector (canary) check on function exit.",
      ],
      correct: 2,
      explain:
        "A variable index into a table of offsets, followed by an indirect <code>jmp</code>, is how compilers lower a dense <code>switch</code>. Because every block returns to it, the function is a loop around that switch, which is exactly the flattened shape of a state machine. A vtable call is a <code>call [reg+fixed_offset]</code> for one method slot, a PLT stub is a single jump through the GOT, and a canary check is a compare followed by a call to <code>__stack_chk_fail</code>. For rustc async, the byte being switched on is the coroutine discriminant.",
    },
    {
      level: "medium",
      topic: "decode the table",
      prompt:
        "The jump table has five entries. Entry 1 leads to a block that calls <code>panic_const_async_fn_resumed</code>, and entry 2 to a trap. What are states 0, 1 and 2 in rustc's async state machine?",
      hint: "Some states are not await points at all. They describe the future as a whole.",
      options: [
        "0 is the start, 1 is the first await, 2 is the second await.",
        "0 is not started, 1 is finished (polling it again panics), 2 is poisoned by a panic. Real suspension points are numbered from 3.",
        "0 is <code>Ready</code>, 1 is <code>Pending</code>, 2 is <code>Panicked</code>.",
        "The numbers are random per build, so the table cannot be decoded.",
      ],
      correct: 1,
      explain:
        "<code>rustc</code> reserves the first three discriminants: unresumed (0), returned (1) and panicked or poisoned (2). Suspension points are numbered from 3, which is why a function with two awaits shows states 3 and 4. Entry 1 calls the \"<code>async fn</code> resumed after completion\" panic, a handy fingerprint that tells you the binary was built from Rust async. <code>Ready</code> and <code>Pending</code> are not states: they are the return value of <code>poll</code>.",
    },
    {
      level: "medium",
      topic: "follow the state writes",
      prompt:
        "You see these writes to <code>cl</code>, the state byte, before the function jumps back to its dispatch. What do they tell you?",
      code: `.suspend1:
    mov    cl, 3        ; state = 3
    jmp    .check
.state3:
    call   charge
    mov    cl, 4        ; state = 4
    jmp    .check
.done:
    mov    cl, 1        ; state = 1`,
      hint: "Before a task hands control back, it must record where to resume.",
      options: [
        "Each write records where to resume before the future yields: 3 and 4 are the two suspension points and 1 is completion. Ordering them gives the original sequence 0, 3, 4, 1.",
        "<code>cl</code> is a loop counter that runs from 1 to 4.",
        "They are return codes passed back to the caller.",
        "They are register spills with no effect on control flow.",
      ],
      correct: 0,
      explain:
        "Right before returning <code>Pending</code>, the future stores the next state, so the following <code>poll</code> jumps straight to the right block through the table. Matching each written value to a table entry, then chaining entry to write to entry, rebuilds the order the author wrote: start, first await, second await, done. It is the reverse of how an obfuscator hides the order, and it is mechanical, which is why this form is only obscurity.",
    },
    {
      level: "medium",
      topic: "where saved locals live",
      prompt:
        "<code>user</code>, returned by <code>authenticate</code>, is used by <code>charge</code> after an await. In a normal (not inlined) build, where do you look for it?",
      hint: "Between two polls the function's own stack frame no longer exists.",
      options: [
        "In the stack frame of <code>poll</code>, at a fixed <code>rsp</code> offset.",
        "In a callee-saved register that the executor preserves between polls.",
        "In a field of the future struct, at <code>[future + offset]</code>, read and written by the state blocks.",
        "In thread-local storage.",
      ],
      correct: 2,
      explain:
        "<code>poll</code> returns to the executor at every <code>Pending</code>, so its frame is gone and no register is guaranteed to survive. Anything needed after an await has to live in the future itself, at a fixed offset from the pointer passed to <code>poll</code>. For an analyst that means recovering the struct layout: each load or store through the first argument is a local, and which fields are valid depends on the current state. In the example on the page the optimizer inlined <code>poll</code> into its caller, so the same values sat in registers instead.",
    },

    // ---------- HARD ----------
    {
      level: "hard",
      topic: "indirect resumption",
      prompt:
        "Why is the instruction that runs <em>right after</em> a suspension point awkward to recover with purely static CFG reconstruction?",
      code: `// executor side, simplified
while let Some(task) = ready_queue.pop() {
    task.future.as_mut().poll(&mut cx);   // dyn dispatch
}`,
      hint: "What decides, at runtime, which future is resumed next, and how is poll reached?",
      options: [
        "Resumption uses a hardware breakpoint the CPU inserts automatically.",
        "The task is resumed by the executor calling <code>poll</code> through dynamic dispatch, and which task runs next is chosen at runtime from a ready queue, so the edge from suspend to resume is data-driven, not a static branch.",
        "The compiler emits a direct jump back into the middle of the original function.",
        "The resume address is always stored in the first field, so it is trivial to follow.",
      ],
      correct: 1,
      explain:
        "After returning <code>Pending</code>, control leaves the future entirely and goes back to the executor. The task is only resumed when its <code>Waker</code> re-queues it and a worker pops it and calls <code>poll</code>, typically through <code>dyn Future</code> dynamic dispatch. So the suspend-to-resume edge is not a CPU branch the disassembler can follow; it runs through a vtable and a runtime scheduling decision. A custom executor and waker add another opaque layer between code order and execution order.",
    },
    {
      level: "hard",
      topic: "security through obscurity",
      prompt:
        "A teammate proposes shipping sensitive logic as deeply nested async specifically to stop reverse engineering. What is the accurate assessment?",
      hint: "Is the state machine recoverable in principle? Does it survive the optimizer?",
      options: [
        "It is sound cryptographic protection, equivalent to encrypting the binary.",
        "It raises the cost of static analysis but is only obscurity: the state machine is mechanically recoverable, decompilers increasingly recognise it, and the optimizer may fold trivial ones away.",
        "It makes the binary provably impossible to decompile.",
        "It has no effect whatsoever on analysis difficulty.",
      ],
      correct: 1,
      explain:
        "The flattening is real and does slow a human reader, but it is deterministic and reversible: the discriminant and per-state fields fully describe the original flow, tooling for recognising async state machines keeps improving, and <code>rustc</code>/LLVM may simplify or inline away a trivial machine. Treating it as a security boundary is security through obscurity. It can be one layer in a defence-in-depth scheme, but it protects nothing on its own and brings real complexity and runtime cost.",
    },
    {
      level: "hard",
      topic: "self-reference and Pin",
      prompt:
        "A binary-rewriting tool wants to relocate a live future to a new address to instrument it. Why is that unsafe once the future has been polled?",
      code: `let mut fut = Box::pin(handle(sock));
fut.as_mut().poll(cx);   // from here: must not move the pointee`,
      hint: "What kind of references can the state machine hold into its own storage, and what trait encodes the promise not to move it?",
      options: [
        "Futures are reference-counted, so moving them leaks memory.",
        "A polled future may be self-referential (fields pointing into its own storage); <code>Pin</code> encodes the promise it will not move, and relocating it would dangle those internal pointers.",
        "Moving a future changes its discriminant to Done.",
        "The executor holds a file lock on the future's address.",
      ],
      correct: 1,
      explain:
        "Across an <code>.await</code>, a borrow of one local can be held while another local lives in the same struct, making the future self-referential once polled. <code>Pin&lt;&amp;mut T&gt;</code> on <code>poll</code> is exactly the promise that from first poll onward the value stays put, keeping those internal references valid. A rewriter that blindly copies the bytes elsewhere invalidates them. Only <code>Unpin</code> futures, which are never self-referential, are safe to move after polling.",
    },
  ];

  const KEYS = ["A", "B", "C", "D"];
  const medCount = QUESTIONS.filter((x) => x.level === "medium").length;
  const hardCount = QUESTIONS.filter((x) => x.level === "hard").length;
  const highlights = [
    "Control-flow flattening",
    "Reading the disassembly",
    "Locals as fields",
    "Call-graph erasure",
    "Indirect resumption",
    "Pin / self-reference",
  ];

  let screen: "start" | "quiz" | "result" = $state("start");
  let current = $state(0);
  let answers: (number | null)[] = $state(
    Array(QUESTIONS.length).fill(null) as (number | null)[],
  );
  let hintOpen = $state(false);
  let rootEl: HTMLDivElement | null = $state(null);

  const q = $derived(QUESTIONS[current]);
  const chosen = $derived(answers[current]);
  const locked = $derived(answers[current] !== null);
  const doneCount = $derived(answers.filter((a) => a !== null).length);
  const progress = $derived(
    screen === "result"
      ? 100
      : Math.round((doneCount / QUESTIONS.length) * 100),
  );
  const score = $derived(
    answers.reduce(
      (s, a, i) => s + (a !== null && a === QUESTIONS[i].correct ? 1 : 0),
      0,
    ),
  );
  const skipped = $derived(answers.filter((a) => a === null).length);
  const pct = $derived(Math.round((score / QUESTIONS.length) * 100));
  const resultMsg = $derived.by(() => {
    let msg: string;
    if (pct === 100) msg = "Every state recovered. You read the machine, not just the source.";
    else if (pct >= 75)
      msg = "Strong grasp of why async warps a binary. Revisit the misses below.";
    else if (pct >= 50)
      msg =
        "The shape is there. The misses below are where the subtleties live.";
    else msg = "Plenty to dig into. The explanations below are the map.";
    if (skipped > 0)
      msg +=
        " " +
        skipped +
        (skipped === 1
          ? " question is still unanswered."
          : " questions are still unanswered.");
    return pct + "%. " + msg;
  });

  const pad = (n: number) => String(n).padStart(2, "0");

  function focusRoot() {
    requestAnimationFrame(() => {
      rootEl?.focus({ preventScroll: true });
      rootEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function start() {
    screen = "quiz";
    focusRoot();
  }
  function choose(i: number) {
    if (answers[current] !== null) return;
    answers[current] = i;
  }
  function goTo(i: number) {
    if (i < 0 || i >= QUESTIONS.length) return;
    current = i;
    hintOpen = false;
    focusRoot();
  }
  function prev() {
    if (current > 0) goTo(current - 1);
  }
  function next() {
    if (current === QUESTIONS.length - 1) {
      screen = "result";
      focusRoot();
    } else goTo(current + 1);
  }
  function restart() {
    answers = Array(QUESTIONS.length).fill(null) as (number | null)[];
    current = 0;
    hintOpen = false;
    screen = "quiz";
    focusRoot();
  }
  function reviewJump(i: number) {
    current = i;
    hintOpen = false;
    screen = "quiz";
    focusRoot();
  }

  function optClass(i: number): string {
    const base =
      "flex w-full items-start gap-3 rounded-lg border border-brand-border border-l-4 px-4 py-3 text-left text-sm leading-relaxed transition-colors";
    if (!locked)
      return (
        base +
        " border-l-gray-200 bg-white hover:border-l-[#D97706] hover:bg-gray-50"
      );
    if (i === q.correct)
      return base + " border-l-accent-green bg-accent-green/15 text-brand-text";
    if (i === chosen) return base + " border-l-[#DC2626] bg-red-50 text-brand-text";
    return base + " border-l-gray-200 bg-white opacity-45";
  }
  function markFor(i: number): string {
    if (!locked) return "";
    if (i === q.correct) return "\u2713";
    if (i === chosen) return "\u2717";
    return "";
  }
  function navClass(i: number): string {
    const base =
      "flex h-8 w-8 items-center justify-center rounded-md border font-mono text-xs transition-colors";
    let c = base;
    if (answers[i] !== null)
      c +=
        answers[i] === QUESTIONS[i].correct
          ? " border-accent-green text-accent-green"
          : " border-[#DC2626] text-[#DC2626]";
    else c += " border-brand-border text-brand-muted hover:border-[#D97706] hover:text-brand-text";
    if (i === current)
      c += " bg-gray-50 ring-1 ring-[#D97706] !border-[#D97706] text-brand-text";
    return c;
  }
  function reviewMark(i: number): string {
    if (answers[i] === null) return "\u2013";
    return answers[i] === QUESTIONS[i].correct ? "\u2713" : "\u2717";
  }
  function reviewMarkClass(i: number): string {
    if (answers[i] === null) return "font-mono text-brand-muted";
    return answers[i] === QUESTIONS[i].correct
      ? "font-mono text-accent-green"
      : "font-mono text-[#DC2626]";
  }

  function handleKey(e: KeyboardEvent) {
    if (screen !== "quiz") return;
    if (!rootEl || !rootEl.contains(document.activeElement)) return;
    const k = e.key;
    const lower = k.toLowerCase();
    if (k === "ArrowRight" || lower === "n") {
      next();
      e.preventDefault();
      return;
    }
    if (k === "ArrowLeft" || lower === "p") {
      prev();
      e.preventDefault();
      return;
    }
    if (answers[current] === null) {
      let idx = -1;
      if (k >= "1" && k <= "4") idx = parseInt(k, 10) - 1;
      const upper = k.toUpperCase();
      if (KEYS.includes(upper)) idx = KEYS.indexOf(upper);
      if (idx >= 0 && idx < q.options.length) {
        choose(idx);
        e.preventDefault();
      }
    }
  }

  const badgeClass = $derived(
    q.level === "medium"
      ? "rounded-full border border-accent-blue/40 bg-accent-blue/5 px-2 py-0.5 text-[0.7rem] text-accent-blue"
      : "rounded-full border border-[#D97706]/40 bg-[#D97706]/5 px-2 py-0.5 text-[0.7rem] text-[#D97706]",
  );
</script>

<svelte:window onkeydown={handleKey} />

<div
  bind:this={rootEl}
  tabindex="-1"
  class="scroll-mt-24 rounded-xl border border-brand-border bg-white p-5 outline-none sm:p-7"
>
  <!-- progress track -->
  <div class="mb-6 h-1 w-full overflow-hidden rounded-full bg-gray-100">
    <div
      class="h-full rounded-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-green transition-[width] duration-300"
      style={`width:${progress}%`}
    ></div>
  </div>

  {#if screen === "start"}
    <p class="mono-eyebrow mb-3">// the state machine is the obfuscation</p>
    <p class="mb-4 text-2xl font-bold tracking-tight text-brand-text">
      Async as binary obfuscation
    </p>
    <p class="mb-5 max-w-2xl text-brand-body">
      A self-check on why lowering async warps a compiled binary: control-flow
      flattening, how to read the jump table and state byte in a disassembly,
      locals promoted to struct fields, a collapsed call graph, resumption
      through an executor, and the <code>Pin</code> invariant. Same format as
      the futures quiz, aimed at the reverse-engineering view.
    </p>
    <pre class="mb-5 overflow-x-auto rounded-lg border border-gray-800 bg-[#0d1117] p-4 font-mono text-xs leading-relaxed text-gray-200">fn poll(self, cx) -&gt; Poll&lt;T&gt; {'{'}
    loop {'{'}
        match self.state {'{'}   // your if/await became data
            // recover me to read the real flow
        {'}'}
    {'}'}
{'}'}</pre>
    <div class="mb-6 flex flex-wrap gap-2">
      <span
        class="rounded-full border border-accent-blue/40 bg-gray-50 px-3 py-1 font-mono text-xs text-accent-blue"
        >{medCount} medium</span
      >
      <span
        class="rounded-full border border-[#D97706]/40 bg-gray-50 px-3 py-1 font-mono text-xs text-[#D97706]"
        >{hardCount} hard</span
      >
      {#each highlights as h}
        <span
          class="rounded-full border border-brand-border bg-gray-50 px-3 py-1 font-mono text-xs text-brand-muted"
          >{h}</span
        >
      {/each}
    </div>
    <button
      class="rounded-lg bg-[#D97706] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B45309]"
      onclick={start}>Start the quiz</button
    >
  {:else if screen === "quiz"}
    <div class="mb-4 flex items-baseline justify-between gap-3 font-mono text-xs">
      <span class="text-brand-muted">q{pad(current + 1)} / {QUESTIONS.length}</span>
      <span class="flex items-baseline gap-2">
        <span class={badgeClass}>{q.level}</span>
        <span style="color:#D97706">{q.topic}</span>
      </span>
    </div>

    <h4 class="mb-2 text-lg font-semibold leading-snug text-brand-text [&_code]:whitespace-normal [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
      {@html q.prompt}
    </h4>

    {#if q.code}
      <pre class="mb-1 mt-4 overflow-x-auto rounded-lg border border-gray-800 border-l-[3px] border-l-[#D97706] bg-[#0d1117] p-4 font-mono text-xs leading-relaxed text-gray-200">{q.code}</pre>
    {/if}

    <div class="my-4">
      <button
        class="font-mono text-xs text-brand-muted underline underline-offset-2 hover:text-brand-text"
        onclick={() => (hintOpen = !hintOpen)}
      >{hintOpen ? "hide hint" : "show hint"}</button>
      {#if hintOpen}
        <div class="mt-2 border-l-2 border-brand-border pl-3 text-sm text-brand-muted [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:font-mono">
          {@html q.hint}
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-2.5" role="group" aria-label="Answer choices">
      {#each q.options as opt, i}
        <button
          class={optClass(i) + " [&_code]:whitespace-normal [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em]"}
          disabled={locked}
          onclick={() => choose(i)}
        >
          <span class="mt-px w-[1.1em] flex-none font-mono text-xs text-brand-muted">{KEYS[i]}</span>
          <span class="flex-1">{@html opt}</span>
          <span
            class="ml-auto flex-none font-mono text-sm"
            class:text-accent-green={locked && i === q.correct}
            class:text-[#DC2626]={locked && i === chosen && i !== q.correct}
          >{markFor(i)}</span>
        </button>
      {/each}
    </div>

    {#if locked}
      <div class="mt-5 rounded-lg border border-brand-border border-l-[3px] border-l-[#D97706] bg-gray-50/70 p-4">
        <div
          class="mb-1.5 font-mono text-sm font-semibold"
          class:text-accent-green={chosen === q.correct}
          class:text-[#DC2626]={chosen !== q.correct}
        >{chosen === q.correct ? "correct" : "not this one"}</div>
        <div class="text-sm leading-relaxed text-brand-body [&_code]:whitespace-normal [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em]">
          {@html q.explain}
        </div>
      </div>
    {/if}

    <div class="mt-7">
      <div class="mb-4 flex flex-wrap gap-1.5">
        {#each QUESTIONS as _, i}
          <button
            class={navClass(i)}
            onclick={() => goTo(i)}
            aria-label={`Question ${i + 1} (${QUESTIONS[i].level})`}
          >{i + 1}</button>
        {/each}
      </div>
      <div class="flex justify-between gap-3">
        <button
          class="rounded-lg border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:bg-gray-50 hover:text-brand-text disabled:opacity-40"
          disabled={current === 0}
          onclick={prev}>Previous</button>
        <button
          class="rounded-lg bg-[#D97706] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B45309]"
          onclick={next}
        >{current === QUESTIONS.length - 1 ? "See results" : "Next question"}</button>
      </div>
    </div>
  {:else}
    <p class="mono-eyebrow mb-3">// evaluation complete</p>
    <p class="mb-1 font-mono text-3xl font-bold tracking-tight">
      <span class="text-accent-green">Poll::Ready</span><span class="text-brand-text"
        >({score} / {QUESTIONS.length})</span
      >
    </p>
    <p class="mb-6 text-brand-muted">{resultMsg}</p>
    <p class="mb-3 text-sm text-brand-muted">
      Select any row to jump back to that question and its explanation.
    </p>
    <div class="mb-7 flex flex-col gap-2">
      {#each QUESTIONS as qq, i}
        <button
          class="flex w-full items-baseline gap-3 rounded-lg border border-brand-border px-4 py-3 text-left text-sm transition-colors hover:border-[#D97706]"
          onclick={() => reviewJump(i)}
        >
          <span class={reviewMarkClass(i) + " flex-none"}>{reviewMark(i)}</span>
          <span class="font-mono text-xs text-brand-muted"
            >q{pad(i + 1)} {qq.level} &middot; {qq.topic}</span
          >
        </button>
      {/each}
    </div>
    <button
      class="rounded-lg border border-brand-border px-6 py-3 text-sm font-medium text-brand-muted transition-colors hover:bg-gray-50 hover:text-brand-text"
      onclick={restart}>Run again</button>
  {/if}
</div>
