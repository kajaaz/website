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
      topic: "await",
      prompt:
        "At an <code>.await</code>, if the awaited future is not ready yet, what does the current task do?",
      hint: "The whole point of async is that one thread serves many tasks. So it cannot just sit there.",
      options: [
        "Blocks its OS thread until the future resolves.",
        "Yields control back to the executor so other tasks can run, and resumes here once it is woken.",
        "Spawns a new thread to wait on the future.",
        "Spins in a busy loop, re-polling the future.",
      ],
      correct: 1,
      explain:
        "<code>.await</code> polls the inner future; if it is <code>Pending</code>, the task hands control back to the executor and parks, freeing the thread for other tasks. When the future becomes ready the task is woken and resumes exactly where it left off. Blocking the thread (option one) is what <code>std</code> blocking calls do, and it is precisely what you must avoid inside async code.",
    },
    {
      level: "medium",
      topic: "return type",
      prompt:
        "What is the return type of <code>async fn parse() -&gt; u32</code> as the caller sees it?",
      hint: "The arrow in the source describes the eventual output, not what the call hands back.",
      options: [
        "<code>u32</code>, available immediately.",
        "A value implementing <code>Future&lt;Output = u32&gt;</code>; you get the <code>u32</code> only after awaiting it.",
        "<code>Poll&lt;u32&gt;</code>.",
        "<code>Result&lt;u32, Error&gt;</code>.",
      ],
      correct: 1,
      explain:
        "An <code>async fn</code> desugars to an ordinary fn returning an opaque <code>impl Future&lt;Output = u32&gt;</code>. Calling it merely constructs that future; the <code>u32</code> appears only when the future is driven to completion by <code>.await</code> or an executor. The <code>-&gt; u32</code> in the signature names the <code>Output</code>, not the call site's immediate result.",
    },
    {
      level: "medium",
      topic: "laziness",
      prompt:
        "You call <code>let fut = download();</code> where <code>download</code> is an <code>async fn</code>, but never await <code>fut</code>. How much of the download runs?",
      hint: "Constructing a future and running it are two separate events in Rust.",
      options: [
        "All of it, in the background.",
        "None of it; the future is inert until something polls it.",
        "It runs up to the first <code>.await</code> inside <code>download</code>, then stops.",
        "It runs on a background thread until <code>fut</code> is dropped.",
      ],
      correct: 1,
      explain:
        "Rust futures are lazy. Constructing one runs none of its body; work happens only when an executor polls it, which <code>.await</code> or <code>spawn</code> arranges. An unawaited future is just a value, and the compiler usually warns that it must be used. This is the opposite of a JavaScript Promise, whose body starts running the instant the Promise is created.",
    },
    {
      level: "medium",
      topic: "runtime",
      prompt:
        "You write a plain <code>fn main()</code> and try to call <code>my_async_fn().await</code> inside it. It will not compile. What is missing?",
      hint: "Two related things: where await is legal, and who actually drives the future.",
      options: [
        "Futures need a runtime to drive them; you await inside an async context entered by an executor, for example <code>#[tokio::main]</code> or <code>block_on</code>.",
        "You must mark <code>main</code> as <code>unsafe</code>.",
        "The standard library runs it automatically once you add <code>use std::future</code>.",
        "You need to enable a compiler flag for async.",
      ],
      correct: 0,
      explain:
        "<code>.await</code> is only legal inside an async context, and something has to poll the resulting future. An executor supplies both: <code>#[tokio::main]</code> rewrites <code>main</code> as an async fn and starts a runtime around it, or <code>runtime.block_on(fut)</code> drives one future to completion from sync code. The standard library ships the <code>Future</code> trait and <code>async</code>/<code>await</code> but no executor, so the runtime is always something you bring.",
    },
    {
      level: "medium",
      topic: "block_on",
      prompt: "What does an executor's <code>block_on(fut)</code> do?",
      hint: "It is the bridge from the synchronous world into the async one.",
      options: [
        "Spawns <code>fut</code> and returns a handle immediately.",
        "Drives <code>fut</code> to completion on the current thread, blocking it until the future resolves, then returns the output.",
        "Converts <code>fut</code> into a synchronous function permanently.",
        "Polls <code>fut</code> exactly once and returns a <code>Poll</code>.",
      ],
      correct: 1,
      explain:
        "<code>block_on</code> parks the current thread and repeatedly drives the given future, handling its wakeups, until it returns <code>Ready</code>, then hands you the output. It is how you enter async from a normal <code>main</code> or a test. Inside already-async code you use <code>.await</code> instead, since calling <code>block_on</code> on an executor thread would tie up that thread and defeat the purpose.",
    },
    {
      level: "medium",
      topic: "sequencing",
      prompt:
        "Inside one async fn you write <code>let a = fetch_a().await; let b = fetch_b().await;</code>. Do the two fetches overlap in time?",
      hint: "Remember futures are lazy. When is fetch_b even constructed?",
      options: [
        "Yes, both start immediately and run at once.",
        "No. <code>fetch_b</code> is not even constructed until <code>fetch_a</code> has fully resolved, so they run strictly one after the other.",
        "Yes, because they are in the same task.",
        "Only if the runtime is multi-threaded.",
      ],
      correct: 1,
      explain:
        "Awaiting is sequential. <code>fetch_a().await</code> must finish before the next statement runs, and because futures are lazy, <code>fetch_b()</code> is not constructed until then, so there is no overlap. To let two operations progress concurrently within one task, construct both futures and drive them together, for example <code>tokio::join!(fetch_a(), fetch_b())</code>. This trap catches people coming from eager-future languages where calling the function already started the work.",
    },
    {
      level: "medium",
      topic: "Future vs Stream",
      prompt: "How does a <code>Stream</code> differ from a <code>Future</code>?",
      hint: "One of them is the async counterpart of a familiar synchronous trait.",
      options: [
        "A <code>Stream</code> is just a <code>Future</code> that happens to be <code>Send</code>.",
        "A <code>Future</code> resolves to one value once; a <code>Stream</code> yields a sequence of values over time, the async analogue of an iterator.",
        "A <code>Stream</code> always runs on a separate thread; a <code>Future</code> does not.",
        "They are the same trait under two names.",
      ],
      correct: 1,
      explain:
        "A <code>Future</code> produces a single <code>Output</code> and is then done. A <code>Stream</code> (from <code>futures</code> or <code>tokio_stream</code>) exposes <code>poll_next</code> and can yield many items before signalling completion with <code>None</code>, making it the async counterpart of <code>Iterator</code>. You consume one with <code>while let Some(item) = stream.next().await</code>. Rust keeps these as distinct traits rather than folding single and multiple async results into one type.",
    },

    // ---------- HARD ----------
    {
      level: "hard",
      topic: "Send bounds",
      prompt:
        'This fails to compile with "future cannot be sent between threads safely." What is the actual cause?',
      code: `let state = Rc::new(RefCell::new(State::new()));

tokio::spawn(async move {
    do_setup().await;              // <-- await point
    state.borrow_mut().update();   // state is alive across it
});`,
      hint: "Which locals does the generated state machine store, and what auto-trait do they drag along?",
      options: [
        "<code>Rc</code> is not <code>Sync</code>, and <code>spawn</code> requires <code>Sync</code> futures.",
        "The <code>Rc</code> stays live across the await point, so the generated future stores it in a field and inherits <code>!Send</code>; <code>tokio::spawn</code> requires <code>Send</code>.",
        "<code>tokio::spawn</code> requires every captured value to be <code>'static</code>, and <code>Rc</code> is not <code>'static</code>.",
        "<code>.await</code> desugars to a thread hand-off that <code>Rc</code> cannot cross.",
      ],
      correct: 1,
      explain:
        "The state machine keeps any local alive across an <code>.await</code> in a field of the future. If one such field is <code>!Send</code> (<code>Rc</code>, a <code>std::sync::MutexGuard</code>, a raw pointer), auto-trait propagation makes the whole future <code>!Send</code>, and <code>tokio::spawn</code> needs <code>Send</code>. Scoping the <code>Rc</code> so it does not straddle the await drops the field and the future becomes <code>Send</code>. Go has no equivalent compile-time check: sharing across goroutines is not in the type system, and races surface only at runtime under the detector.",
    },
    {
      level: "hard",
      topic: "Cancellation safety",
      prompt:
        "If the shutdown branch wins, <code>select!</code> drops the <code>read_line</code> future mid-flight. Why is this a classic bug?",
      code: `tokio::select! {
    _   = shutdown.recv()               => return,
    res = reader.read_line(&mut buf)    => handle(res),
    //    ^ dropped mid-read if shutdown fires first
}`,
      hint: "Cancelling is just dropping. What might read_line have already done to the socket before being dropped?",
      options: [
        "Dropping a future mid-poll leaks its allocated memory.",
        "<code>read_line</code> is not cancellation safe: it can have consumed bytes from the socket into internal state that are discarded when the future is dropped, silently losing data.",
        "<code>select!</code> cannot be used with buffered readers at all.",
        "The dropped branch keeps running in the background and corrupts <code>buf</code>.",
      ],
      correct: 1,
      explain:
        "Cancelling in Rust means dropping the future, which can happen at any await point. A method is cancellation safe only if being dropped before completion loses no observable progress. <code>read_line</code> may pull bytes off the socket and then be dropped before returning them, so those bytes vanish. Cancellation-safe primitives document themselves as such. In Go you do not forcibly cancel a blocked read this way; you thread a <code>context.Context</code> and the operation checks it cooperatively.",
    },
    {
      level: "hard",
      topic: "Scheduling model",
      prompt:
        "On a multi-threaded runtime, this spawned task loops for seconds with no <code>.await</code>. What happens to other tasks?",
      code: `#[tokio::main(flavor = "multi_thread")]
async fn main() {
    tokio::spawn(async {
        let mut n = 0u64;
        for _ in 0..2_000_000_000 { n += 1; }  // no await
    });
    other_tasks().await;
}`,
      hint: "When exactly does a Rust async task hand control back to the executor?",
      options: [
        "They migrate to other worker threads automatically and are unaffected.",
        "The runtime preempts the loop after a time slice, the way an OS scheduler would.",
        "Tasks parked on that worker thread stall until the loop yields, because Rust executors schedule cooperatively and cannot preempt a running <code>poll</code>.",
        "The loop panics because a single <code>poll</code> took too long.",
      ],
      correct: 2,
      explain:
        "Rust async is cooperative: control returns to the executor only at <code>.await</code> points. A <code>poll</code> that never yields owns its worker thread until it finishes, blocking tasks queued on that worker. Work-stealing can rescue tasks sitting on other workers, but not the ones already parked here. Fixes are <code>spawn_blocking</code> or explicit yield points. Go, since 1.14, has asynchronous preemption and can interrupt a goroutine stuck in a tight loop via a signal. JavaScript and Python asyncio are cooperative like Rust, so a tight synchronous loop freezes their event loops too.",
    },
    {
      level: "hard",
      topic: "Pin",
      prompt: "Which statement about moving a future in memory is correct?",
      code: `let fut = some_async_fn();        // never polled: freely movable
let fut = fut;                    // ok, just a value move

let mut pinned = Box::pin(fut);   // pinned from here on
pinned.as_mut().poll(cx);         // must not move it after this`,
      hint: "The line that matters is the transition from unpolled value to pinned-and-polled.",
      options: [
        "A future can never be moved once constructed.",
        "A future can be moved freely before it is pinned and first polled, but must not be moved afterward because it may have become self-referential.",
        "Only futures wrapped in <code>Box</code> can be moved safely.",
        "Moving a future is always safe; <code>Pin</code> is purely a lint.",
      ],
      correct: 1,
      explain:
        "A freshly built future is a plain value and moves like anything else. The danger appears once it is polled, because the state machine can create references into its own fields across await points. <code>Pin&lt;&amp;mut Self&gt;</code> on <code>poll</code> encodes the promise that from pinning onward the value stays put, keeping those internal references valid. Types that are <code>Unpin</code> opt out because they are never self-referential.",
    },
    {
      level: "hard",
      topic: "Unpin",
      prompt: "In this function, why is the <code>get_mut</code> call sound?",
      code: `fn use_it<T: Unpin>(mut p: Pin<&mut T>) {
    let r: &mut T = p.as_mut().get_mut();  // safe here
    // ... use r freely ...
}`,
      hint: 'Unpin is not "cannot be pinned." It is about whether pinning promises anything at all.',
      options: [
        "Because <code>T</code> cannot be placed inside a <code>Pin</code> in the first place.",
        "Because <code>T: Unpin</code> means pinning carries no guarantee, so recovering <code>&amp;mut T</code> (and thus moving <code>T</code>) can never invalidate anything.",
        "Because <code>get_mut</code> secretly re-pins the value afterward.",
        "Because <code>Unpin</code> implies <code>T</code> is <code>Send</code> and <code>Sync</code>.",
      ],
      correct: 1,
      explain:
        "<code>Unpin</code> is the auto-trait for types where pinning is a no-op. If <code>T: Unpin</code>, then <code>Pin&lt;&amp;mut T&gt;</code> hands back <code>&amp;mut T</code> freely via <code>get_mut</code>, since moving <code>T</code> cannot invalidate anything. Most ordinary types are <code>Unpin</code>. Futures from <code>async fn</code> are typically <code>!Unpin</code> because they may hold internal references, which is exactly why you pin them (often with <code>Box::pin</code>) before polling.",
    },
    {
      level: "hard",
      topic: "async in traits",
      prompt:
        "The first trait was rejected before Rust 1.75. What was the underlying reason?",
      code: `trait Fetch {
    async fn get(&self, url: &str) -> Bytes;  // pre-1.75: error
}

#[async_trait]                 // the classic workaround
trait Fetch {
    async fn get(&self, url: &str) -> Bytes;  // -> Pin<Box<dyn Future>>
}`,
      hint: "What type does an async fn actually return, and could a trait name it back then?",
      options: [
        "<code>await</code> was disallowed inside trait method bodies.",
        "Each <code>async fn</code> returns a distinct, unnameable compiler-generated future, and traits had no way to declare that anonymous return type (no return-position <code>impl Trait</code> in traits).",
        "Traits cannot contain methods with generic lifetimes.",
        "The orphan rule forbade implementing <code>Future</code> for trait methods.",
      ],
      correct: 1,
      explain:
        "An <code>async fn</code> desugars to a fn returning an opaque <code>impl Future</code>. Traits must name method return types, and until return-position <code>impl Trait</code> in traits (RPITIT) landed in 1.75, that anonymous future could not be expressed. The <code>async-trait</code> crate boxed the return as <code>Pin&lt;Box&lt;dyn Future + Send&gt;&gt;</code>, trading an allocation for expressibility, and <code>dyn</code> dispatch still needs care. Kotlin sidesteps this: a <code>suspend</code> function in an interface compiles via continuation passing, so there is no return type to name.",
    },
    {
      level: "hard",
      topic: "Waker contract",
      prompt:
        "This <code>poll</code> returns <code>Pending</code> in the else branch. What must it have arranged for the task not to hang forever?",
      code: `fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
    if Instant::now() >= self.deadline {
        Poll::Ready(())
    } else {
        // ??? before returning Pending
        Poll::Pending
    }
}`,
      hint: "Executors do not poll on a timer. So how does this task ever get looked at again?",
      options: [
        "Nothing; the executor re-polls every pending future on a fixed timer.",
        "It must call <code>cx.waker().wake_by_ref()</code> immediately before returning <code>Pending</code>.",
        "It must ensure the <code>Waker</code> from <code>cx</code> will be invoked once the deadline passes (for example, register it with a timer), or the task never resumes.",
        "It must return <code>Pending</code> no more than a fixed number of times.",
      ],
      correct: 2,
      explain:
        "Returning <code>Pending</code> obliges the future to store the current <code>Waker</code> and cause <code>wake()</code> to fire when progress is possible, here when the deadline passes. Executors do not poll on a timer; they only re-poll tasks that have been woken, so a <code>Pending</code> with no registered wake is the canonical lost wakeup and the task stalls. Waking immediately (option two) is not lost-wakeup-safe but it is wasteful: it busy-polls. And <code>poll</code> must tolerate spurious calls, since a task can be woken and polled even when not strictly ready.",
    },
    {
      level: "hard",
      topic: "Concurrency vs parallelism",
      prompt:
        "One task runs this <code>join!</code> on a multi-threaded runtime. Do the two fetches run in parallel on two threads?",
      code: `#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // still ONE task, two futures
    let (a, b) = tokio::join!(fetch_a(), fetch_b());
}`,
      hint: "How many tasks exist here, and what is the unit the runtime places on a worker thread?",
      options: [
        "Yes, <code>join!</code> spawns each future onto its own worker thread.",
        "No. <code>join!</code> drives both futures concurrently within one task on one thread, interleaving them at await points; real parallelism needs separate spawned tasks.",
        "Yes, but only if both futures are <code>Send</code>.",
        "No, <code>join!</code> runs them strictly one after the other.",
      ],
      correct: 1,
      explain:
        "<code>join!</code> is concurrency without parallelism: it polls both futures from the same task, so while one is <code>Pending</code> the other can progress, but they never run on two cores at once. For parallelism, spawn each as its own task (<code>tokio::spawn</code>) and await the handles, letting the runtime place them on different workers. The distinction is muddier in Go, where every goroutine is independently schedulable and two can genuinely run at once up to <code>GOMAXPROCS</code>.",
    },
    {
      level: "hard",
      topic: "Memory footprint",
      prompt:
        "How big is <code>outer</code>'s future, and where does <code>inner</code>'s future live?",
      code: `async fn outer() {
    let buf = [0u8; 1024];
    inner().await;      // inner's future is stored inside outer's
    use_buf(&buf);      // buf is alive across the await -> stored too
}
async fn inner() { /* ... */ }`,
      hint: "Which locals actually need storage, and where does an awaited inner future get placed?",
      options: [
        "One heap allocation per await point, linked together.",
        "A fixed minimum stack of about 2 KB, like a goroutine.",
        "A single value sized to the largest set of locals live across any one await point, with <code>inner</code>'s future inlined into <code>outer</code>'s, so the chain is one flat struct with no per-level heap allocation.",
        "The sum of the sizes of every local, regardless of liveness.",
      ],
      correct: 2,
      explain:
        "The state machine only needs room for the locals that survive across await points (here <code>buf</code>, since it is used after the await), sized to the largest simultaneously-live set plus a small discriminant. Awaiting <code>inner</code> embeds its future as a field, so nesting flattens into one struct rather than a chain of allocations, and nothing touches the heap unless you box it. A Go goroutine's stack starts around 2 KB and grows, whereas a leaf Rust future can be a handful of bytes, which is why spawning millions is feasible.",
    },
    {
      level: "hard",
      topic: "Recursion",
      prompt:
        'The first version fails with "recursion in an async fn requires boxing." Why, and why does the second compile?',
      code: `async fn count(n: u64) {
    if n == 0 { return; }
    count(n - 1).await;      // error: infinitely sized future
}

fn count(n: u64) -> Pin<Box<dyn Future<Output = ()>>> {
    Box::pin(async move {
        if n == 0 { return; }
        count(n - 1).await;  // ok: indirection breaks the cycle
    })
}`,
      hint: "Recall where an inner awaited future is stored relative to its parent.",
      options: [
        "The borrow checker cannot prove the recursion terminates.",
        "The future type would contain itself as a field, making it infinitely sized; <code>Box::pin</code> puts the recursive future behind a pointer of fixed size.",
        "Async functions are simply forbidden from recursing.",
        "The executor's call stack overflows on the first <code>poll</code>.",
      ],
      correct: 1,
      explain:
        "Because an inner awaited future is stored inline in the parent's state machine, direct recursion would make the struct contain a copy of itself, an infinitely large type the compiler rejects at layout time. Wrapping the recursive call in <code>Box::pin</code> places that inner future behind a pointer of fixed size, breaking the cycle. This is a pure type-layout constraint, unrelated to runtime stack depth.",
    },
    {
      level: "hard",
      topic: "Eager vs lazy across languages",
      prompt:
        'Given the same call in each language, which grouping by "starts running on creation" versus "does nothing until awaited or scheduled" is correct?',
      code: `// Rust        let fut  = compute();     // nothing has run
// Python      coro     = compute()      // nothing has run
// JavaScript  const p  = compute();     // body already ran
// C#          var t    = Compute();     // ran up to first await; Task is hot`,
      hint: "Two of these are the surprising ones: the Python coroutine object, and the C# Task.",
      options: [
        "Lazy: Rust, JavaScript, Python. Eager: C#.",
        "Lazy: Rust, Python. Eager: JavaScript Promise, C# Task from an async method.",
        "Everything is eager except Rust.",
        "Everything is lazy except Go.",
      ],
      correct: 1,
      explain:
        'Rust futures and Python coroutine objects are lazy: calling the function returns an inert object that advances only when polled or awaited/scheduled. A JavaScript Promise runs its executor synchronously the instant it is created, and a C# async method runs synchronously up to its first <code>await</code> and returns an already-started (hot) <code>Task</code>. This is one of the most error-prone differences when moving between ecosystems, because "just call it and await later" quietly changes meaning across the line.',
    },
    {
      level: "hard",
      topic: "Structured concurrency",
      prompt: "What is true about the lifetime of this spawned task?",
      code: `let handle = tokio::spawn(async {
    work().await;
});

drop(handle);   // we never await it
// ... the task keeps running, detached from this scope ...`,
      hint: "Does dropping the JoinHandle stop the task? Does Go's model differ?",
      options: [
        "Dropping the handle cancels the task at the next await point.",
        "<code>tokio::spawn</code> is unstructured: the task is detached and can outlive the scope that created it, whereas Kotlin coroutines and Swift bind child tasks to a scope.",
        "The task cannot start until the handle is awaited.",
        "No mainstream language enforces structured concurrency.",
      ],
      correct: 1,
      explain:
        "A <code>tokio::spawn</code> returns a <code>JoinHandle</code> and runs independently; dropping the handle does not stop the task, so it is unstructured by default and easy to leak. Kotlin (<code>CoroutineScope</code>) and Swift (task groups, <code>async let</code>) tie child tasks to a lexical scope and await or cancel them when it ends. Go goroutines are unstructured too: <code>go f()</code> has no join and no scope. Rust does offer scoped patterns (<code>JoinSet</code>, scoped-task libraries), but they are opt-in rather than the default.",
    },
  ];

  const KEYS = ["A", "B", "C", "D"];
  const medCount = QUESTIONS.filter((x) => x.level === "medium").length;
  const hardCount = QUESTIONS.filter((x) => x.level === "hard").length;
  const highlights = [
    "Send across await",
    "Cancellation safety",
    "Pin / Unpin",
    "Waker contract",
    "Structured concurrency",
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
    if (pct === 100) msg = "Every branch resolved. You have this model cold.";
    else if (pct >= 75)
      msg = "Strong grasp of the mechanics. Revisit the misses below.";
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
      return base + " border-l-accent-green bg-accent-green/5 text-brand-text";
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
    <p class="mono-eyebrow mb-3">// warm up, then the sharp edges</p>
    <p class="mb-4 text-2xl font-bold tracking-tight text-brand-text">
      Rust futures, medium to hard
    </p>
    <p class="mb-5 max-w-2xl text-brand-body">
      A few questions to settle the model, then the parts that actually bite:
      how the state machine, the executor, and the type system interact, and
      where Rust diverges from Go, JavaScript, Python, C#, and Kotlin. Hard
      questions come with the code that triggers them.
    </p>
    <pre class="mb-5 overflow-x-auto rounded-lg border border-gray-800 bg-[#0d1117] p-4 font-mono text-xs leading-relaxed text-gray-200">impl Future for You {'{'}
    type Output = Mastery;
    fn poll(self, cx) -&gt; Poll&lt;Output&gt; {'{'}
        // answer them all to reach Poll::Ready
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
