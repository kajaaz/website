<script lang="ts">
  import { RUNTIME_KINDS } from "../lib/runtimeKinds";

  interface CodeExample {
    lang: string;
    source: string;
    caption?: string;
  }
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
    x: number;
    band: number;
    lane: number;
    note?: string;
    typeSystem?: string;
    typeSystemExample?: CodeExample;
    typeSystemHtml: string;
    runtime?: string;
    runtimes?: RuntimeInfo[];
    compilers?: CompilerInfo[];
    asyncRuntimes?: { name: string; role: string }[];
    concurrencyModel?: string;
    concurrencyExample?: CodeExample;
    concurrencyHtml: string;
    codeExample?: CodeExample;
    codeHtml: string;
    popular: boolean;
  }

  function kindMeta(kind: string) {
    return RUNTIME_KINDS[kind] ?? { label: kind, color: "#6B7280" };
  }

  interface Band {
    id: string;
    label: string;
    color: string;
    height: number;
    y: number;
  }

  interface Config {
    plotWidth: number;
    laneHeight: number;
    paddingLeft: number;
    paddingRight: number;
  }

  interface TraitMeta {
    id: string;
    name: string;
    color: string;
  }

  let {
    languages = [],
    bands = [],
    config = { plotWidth: 1100, laneHeight: 17, paddingLeft: 110, paddingRight: 60 },
    traitMeta = [],
    langTraitMap = {},
  }: {
    languages: Language[];
    bands: Band[];
    config: Config;
    traitMeta: TraitMeta[];
    langTraitMap: Record<string, string[]>;
  } = $props();

  let containerWidth = $state(0);

  let selectedLang: Language | null = $state(null);
  let triggerEl: HTMLElement | null = $state(null);
  let panelEl: HTMLElement | null = $state(null);
  let isMobile = $state(false);
  let activeTraits: Set<string> = $state(new Set());

  function checkMobile() {
    isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  }

  $effect(() => {
    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  });

  function openDetail(lang: Language, event: Event) {
    triggerEl = event.currentTarget as HTMLElement;
    selectedLang = lang;
    requestAnimationFrame(() => {
      panelEl?.querySelector<HTMLElement>("[data-close-btn]")?.focus();
    });
  }

  function closeDetail() {
    selectedLang = null;
    triggerEl?.focus();
    triggerEl = null;
  }

  function handlePanelKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDetail();
    }
  }

  function toggleTrait(id: string) {
    const next = new Set(activeTraits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    activeTraits = next;
  }

  function clearTraits() {
    activeTraits = new Set();
  }

  function getTraitColor(langName: string): string | null {
    if (activeTraits.size === 0) return null;
    const ids = langTraitMap[langName] ?? [];
    for (const id of ids) {
      if (activeTraits.has(id)) {
        return traitMeta.find((t) => t.id === id)?.color ?? null;
      }
    }
    return null;
  }

  function langMatches(langName: string): boolean {
    if (activeTraits.size === 0) return true;
    const ids = langTraitMap[langName] ?? [];
    return ids.some((id) => activeTraits.has(id));
  }

  function traitMarkerPositions(
    traitId: string,
  ): { x: number; y: number }[] {
    return languages
      .filter((l) => (langTraitMap[l.name] ?? []).includes(traitId))
      .reduce(
        (acc, l) => {
          const b = bandById(l.paradigm);
          if (b)
            acc.push({
              x: scaleX(l.x),
              y: b.y + 10 + l.lane * config.laneHeight + 3,
            });
          return acc;
        },
        [] as { x: number; y: number }[],
      )
      .sort((a, b) => a.x - b.x);
  }

  const totalHeight = $derived(
    bands.length > 0
      ? bands[bands.length - 1].y + bands[bands.length - 1].height - bands[0].y
      : 500,
  );

  const decades = $derived(
    Array.from({ length: 8 }, (_, i) => 1955 + i * 10).filter(
      (d) => d <= 2025,
    ),
  );

  const plotW = $derived(
    containerWidth > 0 ? Math.floor(containerWidth) : config.plotWidth,
  );
  const xScale = $derived(plotW / config.plotWidth);

  function scaleX(x: number): number {
    return x * xScale;
  }

  function yearToX(year: number): number {
    const { paddingLeft, paddingRight } = config;
    const usable = config.plotWidth - paddingLeft - paddingRight;
    return (paddingLeft + ((year - 1955) / (2025 - 1955)) * usable) * xScale;
  }

  function bandById(id: string): Band | undefined {
    return bands.find((b) => b.id === id);
  }

  const groupedByBand = $derived(
    bands.map((band) => ({
      ...band,
      languages: languages.filter((l) => l.paradigm === band.id),
    })),
  );
</script>

<!-- Trait highlight bar -->
{#if traitMeta.length > 0}
  <div class="mb-6 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50/80 to-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
        <span class="text-sm font-semibold text-gray-700">Highlight shared traits</span>
      </div>
      {#if activeTraits.size > 0}
        <button
          class="rounded-md px-2 py-0.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          onclick={clearTraits}
        >
          Clear all
        </button>
      {/if}
    </div>
    <p class="mb-3 text-xs text-gray-400">
      Toggle one or more traits to see which languages on the timeline share the same characteristic.
    </p>
    <div class="flex flex-wrap gap-1.5">
      {#each traitMeta as trait}
        {@const active = activeTraits.has(trait.id)}
        <button
          class="rounded-full border px-2.5 py-1 text-xs transition-all hover:shadow-sm"
          style="
            border-color: {trait.color}{active ? '' : '44'};
            background: {active ? trait.color + '1A' : 'white'};
            color: {active ? trait.color : '#6B7280'};
            font-weight: {active ? '600' : '400'};
            {active ? `box-shadow: 0 0 0 1px ${trait.color}33;` : ''}
          "
          aria-pressed={active}
          onclick={() => toggleTrait(trait.id)}
        >
          {#if active}<span class="mr-0.5">&#10003;</span>{/if}
          {trait.name}
        </button>
      {/each}
    </div>
  </div>
{/if}

{#if isMobile}
  <p class="mb-3 text-sm text-gray-500">
    Scroll the timeline sideways to explore, or tap any language in the list
    below to open its details.
  </p>
{/if}

<!-- Timeline (fits container width on desktop) -->
<div
  bind:clientWidth={containerWidth}
  class="w-full overflow-x-auto"
  role="region"
  aria-label="Programming languages timeline"
>
  <div
    class="relative"
    style="width: {plotW}px; height: {totalHeight + 50}px"
  >
    <!-- SVG gridlines, band backgrounds, and trait overlays -->
    <svg
      class="pointer-events-none absolute inset-0"
      width={plotW}
      height={totalHeight + 50}
      aria-hidden="true"
    >
      <!-- Band backgrounds -->
      {#each bands as band}
        <rect
          x="0"
          y={band.y}
          width={plotW}
          height={band.height}
          fill={band.color}
          fill-opacity="0.045"
        />
        <line
          x1="0"
          y1={band.y}
          x2={plotW}
          y2={band.y}
          stroke="#E4E4E7"
          stroke-width="1"
        />
        <rect
          x="0"
          y={band.y}
          width="4"
          height={band.height}
          fill={band.color}
        />
        <text x="14" y={band.y + 14} font-size="11.5" font-weight="600" fill={band.color}>
          {band.label}
        </text>
      {/each}
      <!-- Bottom border -->
      {#if bands.length > 0}
        <line
          x1="0"
          y1={bands[bands.length - 1].y + bands[bands.length - 1].height}
          x2={plotW}
          y2={bands[bands.length - 1].y + bands[bands.length - 1].height}
          stroke="#E4E4E7"
          stroke-width="1"
        />
      {/if}

      <!-- Decade gridlines -->
      {#each decades as decade}
        {@const dx = yearToX(decade)}
        <line
          x1={dx}
          y1={bands[0]?.y ?? 50}
          x2={dx}
          y2={(bands[bands.length - 1]?.y ?? 400) +
            (bands[bands.length - 1]?.height ?? 65)}
          stroke="#D4D4D8"
          stroke-width="1"
        />
        <text
          x={dx}
          y={(bands[0]?.y ?? 50) - 8}
          font-size="10.5"
          fill="#52525B"
          text-anchor="middle"
        >
          {decade}
        </text>
      {/each}

      <!-- Half-decade gridlines -->
      {#each decades as decade}
        {@const halfX = yearToX(decade + 5)}
        {#if decade + 5 <= 2025}
          <line
            x1={halfX}
            y1={bands[0]?.y ?? 50}
            x2={halfX}
            y2={(bands[bands.length - 1]?.y ?? 400) +
              (bands[bands.length - 1]?.height ?? 65)}
            stroke="#E4E4E7"
            stroke-width="0.6"
          />
        {/if}
      {/each}

      <!-- Trait circles + connecting lines when traits are active -->
      {#each traitMeta as trait}
        {#if activeTraits.has(trait.id)}
          {@const pts = traitMarkerPositions(trait.id)}
          <!-- Dashed connecting lines between matching markers -->
          {#each pts as pt, i}
            {#if i > 0}
              <line
                x1={pts[i - 1].x}
                y1={pts[i - 1].y}
                x2={pt.x}
                y2={pt.y}
                stroke={trait.color}
                stroke-width="1"
                stroke-opacity="0.15"
                stroke-dasharray="4 3"
              />
            {/if}
          {/each}

          <!-- Highlight circles around matching markers -->
          {#each languages as lang}
            {#if (langTraitMap[lang.name] ?? []).includes(trait.id)}
              {@const b = bandById(lang.paradigm)}
              {#if b}
                <circle
                  cx={scaleX(lang.x)}
                  cy={b.y + 10 + lang.lane * config.laneHeight + 3}
                  r="8"
                  fill={trait.color}
                  fill-opacity="0.08"
                  stroke={trait.color}
                  stroke-width="1.5"
                  stroke-opacity="0.4"
                />
              {/if}
            {/if}
          {/each}
        {/if}
      {/each}
    </svg>

    <!-- Language markers as buttons -->
    {#each languages as lang}
      {@const band = bandById(lang.paradigm)}
      {@const tc = getTraitColor(lang.name)}
      {@const matches = langMatches(lang.name)}
      {#if band}
        <button
          class="group absolute flex items-center gap-1 rounded-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1"
          style="
            left: {scaleX(lang.x) - 4}px;
            top: {band.y + 10 + lang.lane * config.laneHeight}px;
            opacity: {activeTraits.size > 0 && !matches ? 0.1 : 1};
          "
          style:--tw-ring-color={tc ?? band.color}
          aria-label="{lang.name} ({lang.year}, {band.label})"
          onclick={(e) => openDetail(lang, e)}
        >
          <span
            class="inline-block shrink-0 rounded-full"
            style="
              width: {tc ? '9px' : '7px'};
              height: {tc ? '9px' : '7px'};
              background-color: {tc ?? band.color};
              {tc ? `box-shadow: 0 0 6px ${tc}88;` : ''}
            "
          ></span>
          <span
            class="whitespace-nowrap leading-none group-hover:underline"
            style="
              font-size: {lang.popular ? '12.5px' : '11px'};
              font-weight: {lang.popular ? '800' : '400'};
              color: {tc ?? (lang.popular ? '#0F172A' : '#1F2937')};
              {lang.popular ? 'letter-spacing: -0.01em;' : ''}
            "
          >
            {lang.name}
          </span>
        </button>
      {/if}
    {/each}
  </div>
</div>

{#if isMobile}
  <!-- Mobile convenience: tap a language grouped by paradigm -->
  <div class="mt-8 space-y-6">
    <p class="text-sm font-semibold text-gray-700">Browse by paradigm</p>
    {#each groupedByBand as group}
      <section>
        <h3
          class="mb-2 border-l-4 pl-3 text-sm font-semibold"
          style="border-color: {group.color}; color: {group.color}"
        >
          {group.label}
        </h3>
        <div class="space-y-2">
          {#each group.languages.sort((a, b) => a.year - b.year) as lang}
            {@const tc = getTraitColor(lang.name)}
            {@const matches = langMatches(lang.name)}
            <button
              class="w-full rounded-md border px-3 py-2 text-left text-sm transition-all"
              style="
                border-color: {tc ?? '#E5E7EB'};
                opacity: {activeTraits.size > 0 && !matches ? 0.2 : 1};
                {tc ? `background: ${tc}08;` : ''}
              "
              aria-label="{lang.name} ({lang.year}, {lang.paradigm})"
              onclick={(e) => openDetail(lang, e)}
            >
              <span
                style="color: {tc ?? '#111827'}; font-weight: {lang.popular ? '800' : '500'}; {lang.popular ? 'font-size: 0.9375rem;' : ''}"
                >{lang.name}</span
              >
              <span class="ml-2 text-gray-500">{lang.year}</span>
            </button>
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/if}

<!-- Detail Panel (shared between mobile/desktop) -->
{#if selectedLang}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/30"
    onclick={closeDetail}
    aria-hidden="true"
  ></div>

  <!-- Panel -->
  <aside
    bind:this={panelEl}
    class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-gray-200 bg-white shadow-xl sm:w-[420px]"
    role="dialog"
    aria-label="Language details: {selectedLang.name}"
    onkeydown={handlePanelKeydown}
  >
    <div
      class="flex items-start justify-between border-b border-gray-100 p-5"
    >
      <div>
        <h2 class="text-xl font-bold text-gray-900">{selectedLang.name}</h2>
        <p class="mt-0.5 text-sm text-gray-500">
          {selectedLang.year} &middot; {bandById(selectedLang.paradigm)?.label}
        </p>
      </div>
      <button
        data-close-btn
        class="ml-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label="Close detail panel"
        onclick={closeDetail}
      >
        <svg
          class="h-5 w-5"
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

    <div class="flex-1 space-y-5 p-5">
      {#if selectedLang.note}
        <p class="text-sm leading-relaxed text-gray-700">
          {selectedLang.note}
        </p>
      {/if}

      <!-- Trait badges (clickable to toggle that trait on the chart) -->
      {#if (langTraitMap[selectedLang.name] ?? []).length > 0}
        <div>
          <h3 class="mb-2 text-sm font-medium text-gray-500">Shared traits</h3>
          <div class="flex flex-wrap gap-1.5">
            {#each langTraitMap[selectedLang.name] ?? [] as tId}
              {@const t = traitMeta.find((m) => m.id === tId)}
              {#if t}
                <button
                  class="rounded-full border px-2 py-0.5 text-xs transition-all hover:opacity-80"
                  style="border-color: {t.color}; color: {t.color}; background: {t.color}14"
                  onclick={() => {
                    closeDetail();
                    toggleTrait(t.id);
                  }}
                >
                  {t.name}
                </button>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- Type system -->
      {#if selectedLang.typeSystem || selectedLang.typeSystemHtml}
        <section>
          <h3
            class="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            Type system
          </h3>
          {#if selectedLang.typeSystem}
            <p class="text-sm text-gray-800">{selectedLang.typeSystem}</p>
          {/if}
          {#if selectedLang.typeSystemHtml}
            {#if selectedLang.typeSystemExample?.caption}
              <p class="mt-2 text-xs italic text-gray-500">
                {selectedLang.typeSystemExample.caption}
              </p>
            {/if}
            <div
              class="mt-1.5 overflow-x-auto rounded-lg text-xs [&>pre]:!rounded-lg [&>pre]:!p-3"
            >
              {@html selectedLang.typeSystemHtml}
            </div>
          {/if}
        </section>
      {/if}

      <!-- Runtimes -->
      {#if (selectedLang.runtimes && selectedLang.runtimes.length > 0) || selectedLang.runtime}
        <section>
          <h3
            class="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            {selectedLang.runtimes && selectedLang.runtimes.length > 1
              ? "Runtimes"
              : "Runtime"}
          </h3>
          {#if selectedLang.runtimes && selectedLang.runtimes.length > 0}
            <div class="space-y-2">
              {#each selectedLang.runtimes as rt}
                {@const km = kindMeta(rt.kind)}
                <div class="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5">
                  <div class="flex items-center gap-2">
                    <span
                      class="rounded bg-gray-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      >{km.label}</span
                    >
                    <span class="text-sm font-semibold text-gray-900"
                      >{rt.name}</span
                    >
                  </div>
                  <p class="mt-1 text-xs leading-relaxed text-gray-600">
                    {rt.role}
                  </p>
                </div>
              {/each}
            </div>
          {:else if selectedLang.runtime}
            <p class="text-sm text-gray-800">{selectedLang.runtime}</p>
          {/if}
        </section>
      {/if}

      <!-- Compilers & toolchains -->
      {#if selectedLang.compilers && selectedLang.compilers.length > 0}
        <section>
          <h3
            class="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            Compilers / interpreters
          </h3>
          <ul class="space-y-1.5">
            {#each selectedLang.compilers as c}
              <li class="flex flex-col text-sm sm:flex-row sm:items-baseline sm:gap-2">
                <span class="font-mono font-semibold text-gray-900"
                  >{c.name}</span
                >
                <span class="text-xs text-gray-600">{c.role}</span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Async executors -->
      {#if selectedLang.asyncRuntimes && selectedLang.asyncRuntimes.length > 0}
        <section>
          <h3
            class="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            Async executors
          </h3>
          <ul class="space-y-1.5">
            {#each selectedLang.asyncRuntimes as ar}
              <li class="flex flex-col text-sm sm:flex-row sm:items-baseline sm:gap-2">
                <span class="font-mono font-semibold text-gray-900"
                  >{ar.name}</span
                >
                <span class="text-xs text-gray-600">{ar.role}</span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Concurrency model -->
      {#if selectedLang.concurrencyModel || selectedLang.concurrencyHtml}
        <section>
          <h3
            class="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            Concurrency model
          </h3>
          {#if selectedLang.concurrencyModel}
            <p class="text-sm text-gray-800">{selectedLang.concurrencyModel}</p>
          {/if}
          {#if selectedLang.concurrencyHtml}
            {#if selectedLang.concurrencyExample?.caption}
              <p class="mt-2 text-xs italic text-gray-500">
                {selectedLang.concurrencyExample.caption}
              </p>
            {/if}
            <div
              class="mt-1.5 overflow-x-auto rounded-lg text-xs [&>pre]:!rounded-lg [&>pre]:!p-3"
            >
              {@html selectedLang.concurrencyHtml}
            </div>
          {/if}
        </section>
      {/if}

      <!-- General code example -->
      {#if selectedLang.codeHtml}
        <section>
          <h3
            class="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"
          >
            Example
          </h3>
          {#if selectedLang.codeExample?.caption}
            <p class="mb-1.5 text-xs italic text-gray-500">
              {selectedLang.codeExample.caption}
            </p>
          {/if}
          <div
            class="overflow-x-auto rounded-lg text-sm [&>pre]:!rounded-lg [&>pre]:!p-4"
          >
            {@html selectedLang.codeHtml}
          </div>
        </section>
      {/if}

      {#if !selectedLang.note && !selectedLang.typeSystem && !selectedLang.runtime && !selectedLang.concurrencyModel && !selectedLang.codeHtml && !(selectedLang.runtimes && selectedLang.runtimes.length) && !(selectedLang.compilers && selectedLang.compilers.length)}
        <p class="text-sm italic text-gray-400">
          A code example and runtime details for this language are on the way.
        </p>
      {/if}
    </div>
  </aside>
{/if}
