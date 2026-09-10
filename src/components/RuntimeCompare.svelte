<script lang="ts">
  interface RuntimeEntry {
    runtime: string;
    accent: string;
    note: string;
    simpleDiff: string;
    simpleHtml: string;
    diff: string;
    html: string;
    properties: Record<string, string>;
  }

  let {
    runtimes = [],
    defaults = [],
  }: {
    runtimes: RuntimeEntry[];
    defaults: string[];
  } = $props();

  const MAX = 4;

  const propertyRows = [
    "Scheduler",
    "I/O backend",
    "Spawn bounds",
    "Wakeup / signal",
    "Fan-out",
    "Parallelism",
    "Best for",
  ];

  let selected: (string | null)[] = $state(
    Array.from({ length: MAX }, (_, i) => defaults[i] ?? null),
  );

  let queries: string[] = $state(Array(MAX).fill(""));
  let openSlot: number | null = $state(null);

  function focusOnMount(node: HTMLInputElement) {
    requestAnimationFrame(() => node.focus());
  }

  function byName(name: string | null): RuntimeEntry | undefined {
    return name ? runtimes.find((r) => r.runtime === name) : undefined;
  }

  function pick(slot: number, name: string) {
    selected = selected.map((s, i) => (i === slot ? name : s));
    queries[slot] = "";
    openSlot = null;
  }

  function clear(slot: number) {
    selected = selected.map((s, i) => (i === slot ? null : s));
    queries[slot] = "";
  }

  function toggleSlot(slot: number) {
    openSlot = openSlot === slot ? null : slot;
    if (openSlot === slot) queries[slot] = "";
  }

  function filtered(slot: number): RuntimeEntry[] {
    const q = queries[slot].toLowerCase();
    const others = new Set(selected.filter((_, i) => i !== slot));
    return runtimes
      .filter((r) => !others.has(r.runtime))
      .filter((r) => !q || r.runtime.toLowerCase().includes(q));
  }

  function handleDropdownKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      openSlot = null;
    }
  }

  function handleWindowClick(e: MouseEvent) {
    if (openSlot !== null) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-compare-dd]")) {
        openSlot = null;
      }
    }
  }

  const activeRuntimes = $derived(
    selected.map(byName).filter((r): r is RuntimeEntry => !!r),
  );

  const colCount = $derived(activeRuntimes.length);
</script>

<svelte:window onclick={handleWindowClick} />

<!-- Runtime selector slots -->
<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
  {#each { length: MAX } as _, i}
    <div class="relative" data-compare-dd>
      {#if selected[i]}
        {@const rt = byName(selected[i])}
        <div
          class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <button
            class="flex flex-col text-left"
            onclick={() => toggleSlot(i)}
          >
            <span class="text-sm font-bold text-gray-900"
              >{selected[i]}</span
            >
            {#if rt}
              <span
                class="mt-0.5 text-[10px] font-medium"
                style="color: {rt.accent}"
              >async runtime</span>
            {/if}
          </button>
          <button
            class="ml-2 rounded p-0.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
            onclick={() => clear(i)}
            aria-label="Remove {selected[i]}"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      {:else}
        <button
          class="flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-3 py-3 text-sm text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500"
          onclick={() => toggleSlot(i)}
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add runtime
        </button>
      {/if}

      <!-- Dropdown -->
      {#if openSlot === i}
        <div
          class="absolute left-0 top-full z-30 mt-1 w-60 rounded-lg border border-gray-200 bg-white shadow-xl"
          role="listbox"
          onkeydown={handleDropdownKey}
        >
          <div class="border-b border-gray-100 px-3 py-2">
            <input
              use:focusOnMount
              type="text"
              class="w-full text-sm outline-none placeholder:text-gray-400"
              placeholder="Search runtimes..."
              bind:value={queries[i]}
            />
          </div>
          <ul class="max-h-52 overflow-y-auto py-1">
            {#each filtered(i) as rt}
              <li>
                <button
                  class="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                  onclick={() => pick(i, rt.runtime)}
                >
                  <span class="flex items-center gap-2 text-gray-900">
                    <span
                      class="inline-block h-2 w-2 shrink-0 rounded-sm"
                      style="background-color: {rt.accent}"
                    ></span>
                    {rt.runtime}
                  </span>
                </button>
              </li>
            {/each}
            {#if filtered(i).length === 0}
              <li class="px-3 py-2 text-xs italic text-gray-400">
                No match
              </li>
            {/if}
          </ul>
        </div>
      {/if}
    </div>
  {/each}
</div>

<!-- Comparison table -->
{#if activeRuntimes.length >= 2}
  <div class="mt-8 overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b-2 border-gray-200">
          <th class="w-40 py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"></th>
          {#each activeRuntimes as rt}
            <th class="px-4 py-3 text-center">
              <span class="flex items-center justify-center gap-2 text-lg font-extrabold text-gray-900">
                <span class="inline-block h-3 w-3 shrink-0 rounded-sm" style="background-color: {rt.accent}"></span>
                {rt.runtime}
              </span>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <!-- Description -->
        <tr class="border-b border-gray-100">
          <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500">Description</td>
          {#each activeRuntimes as rt}
            <td class="px-4 py-2.5 text-center text-xs text-gray-600">{rt.note}</td>
          {/each}
        </tr>

        <!-- Property rows -->
        {#each propertyRows as prop}
          <tr class="border-b border-gray-100">
            <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500">{prop}</td>
            {#each activeRuntimes as rt}
              <td class="px-4 py-2.5 text-center text-xs text-gray-700">
                {rt.properties[prop] ?? "·"}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Code: simple async hello world -->
  <div class="mt-10">
    <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      Spawn &amp; collect
    </p>
    <p class="mb-4 text-xs text-gray-400">
      Same task as the sync/async example: spawn 4 workers, each computes <code class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[11px]">i * i</code>, then collect the results
    </p>
    <div class="grid gap-4" style="grid-template-columns: repeat({colCount}, 1fr)">
      {#each activeRuntimes as rt}
        <div>
          <p class="mb-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span class="inline-block h-2 w-2 rounded-sm" style="background-color: {rt.accent}"></span>
            {rt.runtime}
          </p>
          <p class="mb-2 text-[11px] leading-relaxed text-gray-500">{rt.simpleDiff}</p>
          <div class="overflow-x-auto rounded-lg text-[11px] [&>pre]:!rounded-lg [&>pre]:!p-3">
            {@html rt.simpleHtml}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Code: Outbox relay worker (same pattern) -->
  <div class="mt-10">
    <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      Outbox relay worker
    </p>
    <p class="mb-4 text-xs text-gray-400">
      A real-world pattern: 1 listener signals a wakeup, N workers relay in parallel
    </p>
    <div class="grid gap-4" style="grid-template-columns: repeat({colCount}, 1fr)">
      {#each activeRuntimes as rt}
        <div>
          <p class="mb-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span class="inline-block h-2 w-2 rounded-sm" style="background-color: {rt.accent}"></span>
            {rt.runtime}
          </p>
          <p class="mb-2 text-[11px] leading-relaxed text-gray-500">{rt.diff}</p>
          <div class="overflow-x-auto rounded-lg text-[11px] [&>pre]:!rounded-lg [&>pre]:!p-3">
            {@html rt.html}
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if activeRuntimes.length === 1}
  <p class="mt-8 text-center text-sm text-gray-400">
    Select at least one more runtime to start comparing.
  </p>
{:else}
  <p class="mt-8 text-center text-sm text-gray-400">
    Select two or more runtimes above to compare.
  </p>
{/if}
