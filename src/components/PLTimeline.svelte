<script lang="ts">
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
    runtime?: string;
    concurrencyModel?: string;
    codeHtml: string;
    popular: boolean;
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

  let {
    languages = [],
    bands = [],
    config = { plotWidth: 1100, laneHeight: 17, paddingLeft: 150, paddingRight: 24 },
  }: {
    languages: Language[];
    bands: Band[];
    config: Config;
  } = $props();

  let selectedLang: Language | null = $state(null);
  let triggerEl: HTMLElement | null = $state(null);
  let panelEl: HTMLElement | null = $state(null);
  let isMobile = $state(false);

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

  function yearToX(year: number): number {
    const { paddingLeft, paddingRight } = config;
    const usable = config.plotWidth - paddingLeft - paddingRight;
    return paddingLeft + ((year - 1955) / (2025 - 1955)) * usable;
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

{#if isMobile}
  <!-- Mobile: vertical list grouped by band -->
  <div class="space-y-6">
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
            <button
              class="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
              aria-label="{lang.name} ({lang.year}, {lang.paradigm})"
              onclick={(e) => openDetail(lang, e)}
            >
              <span class="text-gray-900" class:font-bold={lang.popular} class:font-medium={!lang.popular}>{lang.name}</span>
              <span class="ml-2 text-gray-500">{lang.year}</span>
            </button>
          {/each}
        </div>
      </section>
    {/each}
  </div>
{:else}
  <!-- Desktop: horizontal scrollable timeline -->
  <div class="overflow-x-auto" role="region" aria-label="Programming languages timeline">
    <div class="relative" style="width: {config.plotWidth}px; height: {totalHeight + 50}px">
      <!-- SVG gridlines and band backgrounds -->
      <svg
        class="pointer-events-none absolute inset-0"
        width={config.plotWidth}
        height={totalHeight + 50}
        aria-hidden="true"
      >
        <!-- Band backgrounds -->
        {#each bands as band}
          <rect
            x="0"
            y={band.y}
            width={config.plotWidth}
            height={band.height}
            fill={band.color}
            fill-opacity="0.045"
          />
          <line
            x1="0"
            y1={band.y}
            x2={config.plotWidth}
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
          <text
            x="14"
            y={band.y + 14}
            font-size="11.5"
            font-weight="600"
            fill={band.color}
          >
            {band.label}
          </text>
        {/each}
        <!-- Bottom border -->
        {#if bands.length > 0}
          <line
            x1="0"
            y1={bands[bands.length - 1].y + bands[bands.length - 1].height}
            x2={config.plotWidth}
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
            y2={(bands[bands.length - 1]?.y ?? 400) + (bands[bands.length - 1]?.height ?? 65)}
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
              y2={(bands[bands.length - 1]?.y ?? 400) + (bands[bands.length - 1]?.height ?? 65)}
              stroke="#E4E4E7"
              stroke-width="0.6"
            />
          {/if}
        {/each}
      </svg>

      <!-- Language markers as buttons -->
      {#each languages as lang}
        {@const band = bandById(lang.paradigm)}
        {#if band}
          <button
            class="group absolute flex items-center gap-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
            style="
              left: {lang.x - 4}px;
              top: {band.y + 10 + lang.lane * config.laneHeight}px;
              --ring-color: {band.color};
            "
            style:--tw-ring-color={band.color}
            aria-label="{lang.name} ({lang.year}, {band.label})"
            onclick={(e) => openDetail(lang, e)}
          >
            <span
              class="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
              style="background-color: {band.color}"
            ></span>
            <span
              class="whitespace-nowrap text-[11px] leading-none text-gray-800 group-hover:text-black group-hover:underline"
              class:font-bold={lang.popular}
            >
              {lang.name}
            </span>
          </button>
        {/if}
      {/each}
    </div>
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
    <div class="flex items-start justify-between border-b border-gray-100 p-5">
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
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="flex-1 space-y-5 p-5">
      {#if selectedLang.note}
        <p class="text-sm leading-relaxed text-gray-700">{selectedLang.note}</p>
      {/if}

      {#if selectedLang.typeSystem || selectedLang.runtime || selectedLang.concurrencyModel}
        <dl class="space-y-3 text-sm">
          {#if selectedLang.typeSystem}
            <div>
              <dt class="font-medium text-gray-500">Type System</dt>
              <dd class="mt-0.5 text-gray-900">{selectedLang.typeSystem}</dd>
            </div>
          {/if}
          {#if selectedLang.runtime}
            <div>
              <dt class="font-medium text-gray-500">Runtime</dt>
              <dd class="mt-0.5 text-gray-900">{selectedLang.runtime}</dd>
            </div>
          {/if}
          {#if selectedLang.concurrencyModel}
            <div>
              <dt class="font-medium text-gray-500">Concurrency Model</dt>
              <dd class="mt-0.5 text-gray-900">{selectedLang.concurrencyModel}</dd>
            </div>
          {/if}
        </dl>
      {/if}

      {#if selectedLang.codeHtml}
        <div>
          <h3 class="mb-2 text-sm font-medium text-gray-500">Code Example</h3>
          <div class="overflow-x-auto rounded-lg text-sm [&>pre]:!rounded-lg [&>pre]:!p-4">
            {@html selectedLang.codeHtml}
          </div>
        </div>
      {/if}

      {#if !selectedLang.note && !selectedLang.typeSystem && !selectedLang.runtime && !selectedLang.concurrencyModel && !selectedLang.codeHtml}
        <p class="text-sm italic text-gray-400">
          A code example and runtime details for this language are on the way.
        </p>
      {/if}
    </div>
  </aside>
{/if}
