<script lang="ts">
  import { RUNTIME_KINDS } from "../lib/runtimeKinds";

  interface RuntimeInfo {
    name: string;
    kind: string;
    role: string;
  }
  interface CompilerInfo {
    name: string;
    role: string;
  }
  interface Language {
    id: string;
    name: string;
    year: number;
    paradigm: string;
    note?: string;
    typeSystem?: string;
    runtime?: string;
    runtimes?: RuntimeInfo[];
    compilers?: CompilerInfo[];
    asyncRuntimes?: { name: string; role: string }[];
    concurrencyModel?: string;
    codeHtml: string;
    typeSystemHtml: string;
    concurrencyHtml: string;
    popular: boolean;
  }

  function kindMeta(kind: string) {
    return RUNTIME_KINDS[kind] ?? { label: kind, color: "#6B7280" };
  }

  interface TraitMeta {
    id: string;
    name: string;
    color: string;
  }

  let {
    languages = [],
    bands = [],
    traitMeta = [],
    langTraitMap = {},
    defaults = [],
  }: {
    languages: Language[];
    bands: { id: string; label: string; color: string }[];
    traitMeta: TraitMeta[];
    langTraitMap: Record<string, string[]>;
    defaults: string[];
  } = $props();

  const MAX = 4;

  let selected: (string | null)[] = $state(
    Array.from({ length: MAX }, (_, i) =>
      languages.find((l) => l.name === (defaults[i] ?? ""))?.name ?? null,
    ),
  );

  let queries: string[] = $state(Array(MAX).fill(""));
  let openSlot: number | null = $state(null);

  function focusOnMount(node: HTMLInputElement) {
    requestAnimationFrame(() => node.focus());
  }

  function byName(name: string | null): Language | undefined {
    return name ? languages.find((l) => l.name === name) : undefined;
  }

  function bandLabel(id: string): string {
    return bands.find((b) => b.id === id)?.label ?? id;
  }

  function bandColor(id: string): string {
    return bands.find((b) => b.id === id)?.color ?? "#94A3B8";
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

  function filtered(slot: number): Language[] {
    const q = queries[slot].toLowerCase();
    const others = new Set(selected.filter((_, i) => i !== slot));
    return languages
      .filter((l) => !others.has(l.name))
      .filter((l) => !q || l.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.popular !== b.popular) return a.popular ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 40);
  }

  function hasTrait(langName: string, traitId: string): boolean {
    return (langTraitMap[langName] ?? []).includes(traitId);
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

  const activeLangs = $derived(
    selected.map(byName).filter((l): l is Language => !!l),
  );

  const relevantTraits = $derived(
    traitMeta.filter((t) =>
      activeLangs.some((l) => (langTraitMap[l.name] ?? []).includes(t.id)),
    ),
  );

  const colCount = $derived(activeLangs.length);
</script>

<svelte:window onclick={handleWindowClick} />

<!-- Language selector slots -->
<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
  {#each { length: MAX } as _, i}
    <div class="relative" data-compare-dd>
      {#if selected[i]}
        {@const lang = byName(selected[i])}
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
            {#if lang}
              <span
                class="mt-0.5 text-[10px] font-medium"
                style="color: {bandColor(lang.paradigm)}"
                >{lang.year} · {bandLabel(lang.paradigm)}</span
              >
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
          Add language
        </button>
      {/if}

      <!-- Dropdown -->
      {#if openSlot === i}
        <div
          class="absolute left-0 top-full z-30 mt-1 w-60 rounded-lg border border-gray-200 bg-white shadow-xl"
          onkeydown={handleDropdownKey}
        >
          <div class="border-b border-gray-100 px-3 py-2">
            <input
              use:focusOnMount
              type="text"
              class="w-full text-sm outline-none placeholder:text-gray-400"
              placeholder="Search languages..."
              bind:value={queries[i]}
            />
          </div>
          <ul class="max-h-52 overflow-y-auto py-1">
            {#each filtered(i) as lang}
              <li>
                <button
                  class="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                  onclick={() => pick(i, lang.name)}
                >
                  <span
                    style="font-weight: {lang.popular ? '700' : '400'}"
                    class="text-gray-900">{lang.name}</span
                  >
                  <span class="text-xs text-gray-400">{lang.year}</span>
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
{#if activeLangs.length >= 2}
  <div class="mt-8 overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b-2 border-gray-200">
          <th class="w-40 py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"></th>
          {#each activeLangs as lang}
            <th class="px-4 py-3 text-center">
              <span class="text-lg font-extrabold text-gray-900"
                >{lang.name}</span
              >
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <!-- Year -->
        <tr class="border-b border-gray-100">
          <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500"
            >Year</td
          >
          {#each activeLangs as lang}
            <td class="px-4 py-2.5 text-center font-mono text-sm text-gray-800"
              >{lang.year}</td
            >
          {/each}
        </tr>

        <!-- Paradigm -->
        <tr class="border-b border-gray-100">
          <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500"
            >Paradigm</td
          >
          {#each activeLangs as lang}
            <td class="px-4 py-2.5 text-center">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style="background: {bandColor(lang.paradigm)}15; color: {bandColor(lang.paradigm)}"
              >
                {bandLabel(lang.paradigm)}
              </span>
            </td>
          {/each}
        </tr>

        <!-- Type system -->
        <tr class="border-b border-gray-100">
          <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500"
            >Type system</td
          >
          {#each activeLangs as lang}
            <td
              class="px-4 py-2.5 text-center text-xs text-gray-700"
              class:text-gray-300={!lang.typeSystem}
            >
              {lang.typeSystem || ""}
            </td>
          {/each}
        </tr>

        <!-- Runtimes -->
        <tr class="border-b border-gray-100 align-top">
          <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500"
            >Runtimes</td
          >
          {#each activeLangs as lang}
            <td class="px-4 py-2.5 text-center">
              {#if lang.runtimes && lang.runtimes.length > 0}
                <div class="flex flex-col items-center gap-1.5">
                  {#each lang.runtimes as rt}
                    {@const km = kindMeta(rt.kind)}
                    <span
                      class="inline-flex items-center gap-1.5 rounded bg-gray-100 px-2 py-0.5 text-[11px]"
                      title={rt.role}
                    >
                      <span
                        class="shrink-0 rounded-sm bg-gray-500 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white"
                      >{km.label}</span>
                      <span class="text-gray-700">{rt.name}</span>
                    </span>
                  {/each}
                </div>
              {:else if lang.runtime}
                <span class="text-xs text-gray-700">{lang.runtime}</span>
              {:else}
                <span class="text-gray-300">·</span>
              {/if}
            </td>
          {/each}
        </tr>

        <!-- Compilers / interpreters -->
        <tr class="border-b border-gray-100 align-top">
          <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500"
            >Compiler / interpreter</td
          >
          {#each activeLangs as lang}
            <td class="px-4 py-2.5 text-center">
              {#if lang.compilers && lang.compilers.length > 0}
                <div class="flex flex-col items-center gap-1">
                  {#each lang.compilers as c}
                    <span
                      class="font-mono text-[11px] text-gray-700"
                      title={c.role}>{c.name}</span
                    >
                  {/each}
                </div>
              {:else}
                <span class="text-gray-300">·</span>
              {/if}
            </td>
          {/each}
        </tr>

        <!-- Async executors -->
        {#if activeLangs.some((l) => l.asyncRuntimes && l.asyncRuntimes.length > 0)}
          <tr class="border-b border-gray-100 align-top">
            <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500"
              >Async executors</td
            >
            {#each activeLangs as lang}
              <td class="px-4 py-2.5 text-center">
                {#if lang.asyncRuntimes && lang.asyncRuntimes.length > 0}
                  <div class="flex flex-col items-center gap-1">
                    {#each lang.asyncRuntimes as ar}
                      <span
                        class="font-mono text-[11px] text-gray-700"
                        title={ar.role}>{ar.name}</span
                      >
                    {/each}
                  </div>
                {:else}
                  <span class="text-gray-300">·</span>
                {/if}
              </td>
            {/each}
          </tr>
        {/if}

        <!-- Concurrency -->
        <tr class="border-b-2 border-gray-200">
          <td class="py-2.5 pr-4 text-xs font-semibold text-gray-500"
            >Concurrency</td
          >
          {#each activeLangs as lang}
            <td
              class="px-4 py-2.5 text-center text-xs text-gray-700"
              class:text-gray-300={!lang.concurrencyModel}
            >
              {lang.concurrencyModel || ""}
            </td>
          {/each}
        </tr>

        <!-- Traits section header -->
        <tr>
          <td
            colspan={colCount + 1}
            class="pb-1 pt-5 text-[10px] font-bold uppercase tracking-widest text-gray-400"
          >
            Shared traits
          </td>
        </tr>

        <!-- Trait rows -->
        {#each relevantTraits as trait}
          <tr class="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
            <td class="py-2 pr-4">
              <span class="flex items-center gap-2 text-xs text-gray-600">
                <span
                  class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style="background: {trait.color}"
                ></span>
                {trait.name}
              </span>
            </td>
            {#each activeLangs as lang}
              <td class="px-4 py-2 text-center">
                {#if hasTrait(lang.name, trait.id)}
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style="background: {trait.color}15; color: {trait.color}"
                    >&#10003;</span
                  >
                {:else}
                  <span class="text-sm text-gray-200">&middot;</span>
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Code examples: Hello World -->
  {#if activeLangs.some((l) => l.codeHtml)}
    <div class="mt-10">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Hello, World!
      </p>
      <p class="mb-4 text-xs text-gray-400">
        The simplest possible program in each language
      </p>
      <div class="grid gap-4" style="grid-template-columns: repeat({colCount}, 1fr)">
        {#each activeLangs as lang}
          <div>
            <p class="mb-1.5 text-xs font-semibold text-gray-600">{lang.name}</p>
            {#if lang.codeHtml}
              <div class="overflow-x-auto rounded-lg text-[11px] [&>pre]:!rounded-lg [&>pre]:!p-3">
                {@html lang.codeHtml}
              </div>
            {:else}
              <div class="rounded-lg bg-gray-50 p-4 text-center text-xs italic text-gray-400">
                No example
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Code examples: Type system — same task: generic max(a, b) -->
  {#if activeLangs.some((l) => l.typeSystemHtml)}
    <div class="mt-10">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Type system
      </p>
      <p class="mb-4 text-xs text-gray-400">
        Same task: a generic <code class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[11px]">max(a, b)</code> function
      </p>
      <div class="grid gap-4" style="grid-template-columns: repeat({colCount}, 1fr)">
        {#each activeLangs as lang}
          <div>
            <p class="mb-1.5 text-xs font-semibold text-gray-600">{lang.name}</p>
            {#if lang.typeSystemHtml}
              <div class="overflow-x-auto rounded-lg text-[11px] [&>pre]:!rounded-lg [&>pre]:!p-3">
                {@html lang.typeSystemHtml}
              </div>
            {:else}
              <div class="rounded-lg bg-gray-50 p-4 text-center text-xs italic text-gray-400">
                No example
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Code examples: Concurrency — same task: 4 parallel workers computing i*i -->
  {#if activeLangs.some((l) => l.concurrencyHtml)}
    <div class="mt-10">
      <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Concurrency
      </p>
      <p class="mb-4 text-xs text-gray-400">
        Same task: spawn 4 workers, each computes <code class="rounded bg-gray-100 px-1 py-0.5 font-mono text-[11px]">i * i</code>, collect results
      </p>
      <div class="grid gap-4" style="grid-template-columns: repeat({colCount}, 1fr)">
        {#each activeLangs as lang}
          <div>
            <p class="mb-1.5 text-xs font-semibold text-gray-600">{lang.name}</p>
            {#if lang.concurrencyHtml}
              <div class="overflow-x-auto rounded-lg text-[11px] [&>pre]:!rounded-lg [&>pre]:!p-3">
                {@html lang.concurrencyHtml}
              </div>
            {:else}
              <div class="rounded-lg bg-gray-50 p-4 text-center text-xs italic text-gray-400">
                No example
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
{:else if activeLangs.length === 1}
  <p class="mt-8 text-center text-sm text-gray-400">
    Select at least one more language to start comparing.
  </p>
{:else}
  <p class="mt-8 text-center text-sm text-gray-400">
    Select two or more languages above to compare.
  </p>
{/if}
