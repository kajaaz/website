export const PARADIGM_ORDER = [
  "dependently-typed",
  "logic-relational",
  "functional-pure",
  "functional-impure",
  "multi-paradigm",
  "object-oriented",
  "imperative-procedural",
] as const;

export type Paradigm = (typeof PARADIGM_ORDER)[number];

export const BAND_META: Record<
  Paradigm,
  { label: string; color: string; height: number }
> = {
  "dependently-typed": {
    label: "Dependently typed",
    color: "#8B5CF6",
    height: 48,
  },
  "logic-relational": {
    label: "Logic / relational",
    color: "#0EA5E9",
    height: 48,
  },
  "functional-pure": {
    label: "Functional (pure)",
    color: "#059669",
    height: 48,
  },
  "functional-impure": {
    label: "Functional (impure)",
    color: "#65A30D",
    height: 82,
  },
  "multi-paradigm": {
    label: "Multi-paradigm",
    color: "#D97706",
    height: 65,
  },
  "object-oriented": {
    label: "Object-oriented",
    color: "#DC2626",
    height: 82,
  },
  "imperative-procedural": {
    label: "Procedural",
    color: "#9F1239",
    height: 65,
  },
};

export interface LanguageEntry {
  id: string;
  name: string;
  year: number;
  paradigm: Paradigm;
  note?: string;
  typeSystem?: string;
  runtime?: string;
  concurrencyModel?: string;
  codeExample?: { lang: string; source: string };
}

export interface ComputedLanguage extends LanguageEntry {
  x: number;
  band: number;
  lane: number;
  codeHtml: string;
  popular: boolean;
  hasDetail: boolean;
}

export interface TimelineConfig {
  plotWidth: number;
  paddingLeft: number;
  paddingRight: number;
  laneHeight: number;
  bandGap: number;
  yearMin: number;
  yearMax: number;
}

const DEFAULT_CONFIG: TimelineConfig = {
  plotWidth: 1100,
  paddingLeft: 150,
  paddingRight: 24,
  laneHeight: 17,
  bandGap: 0,
  yearMin: 1955,
  yearMax: 2025,
};

const CHAR_WIDTH = 7;
const MARKER_RADIUS = 4;
const LABEL_GAP = 6;

function estimateLabelRight(x: number, name: string): number {
  return x + MARKER_RADIUS + LABEL_GAP + name.length * CHAR_WIDTH;
}

export function computeTimeline(
  entries: LanguageEntry[],
  config: TimelineConfig = DEFAULT_CONFIG,
): ComputedLanguage[] {
  const { plotWidth, paddingLeft, paddingRight, yearMin, yearMax } = config;
  const usableWidth = plotWidth - paddingLeft - paddingRight;

  function yearToX(year: number): number {
    return (
      paddingLeft +
      ((year - yearMin) / (yearMax - yearMin)) * usableWidth
    );
  }

  const byBand = new Map<number, (LanguageEntry & { x: number })[]>();

  for (const entry of entries) {
    const bandIndex = PARADIGM_ORDER.indexOf(entry.paradigm);
    const x = yearToX(entry.year);
    if (!byBand.has(bandIndex)) byBand.set(bandIndex, []);
    byBand.get(bandIndex)!.push({ ...entry, x });
  }

  const results: ComputedLanguage[] = [];

  for (const [bandIndex, langs] of byBand) {
    langs.sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

    const laneRightEdges: number[] = [];

    for (const lang of langs) {
      let assignedLane = 0;
      for (let lane = 0; lane < laneRightEdges.length; lane++) {
        if (lang.x > laneRightEdges[lane]) {
          assignedLane = lane;
          break;
        }
        assignedLane = lane + 1;
      }

      if (assignedLane >= laneRightEdges.length) {
        laneRightEdges.push(0);
      }

      laneRightEdges[assignedLane] = estimateLabelRight(lang.x, lang.name);

      results.push({
        ...lang,
        band: bandIndex,
        lane: assignedLane,
        codeHtml: "",
        popular: false,
        hasDetail: Boolean(
          lang.typeSystem ||
            lang.runtime ||
            lang.concurrencyModel ||
            lang.codeExample ||
            lang.note,
        ),
      });
    }
  }

  return results;
}

export interface BandInfo {
  id: Paradigm;
  label: string;
  color: string;
  height: number;
  y: number;
}

export function computeBands(
  config: TimelineConfig = DEFAULT_CONFIG,
  computed?: ComputedLanguage[],
): BandInfo[] {
  // When the computed languages are supplied, size every band to the number of
  // lanes it actually uses so dense bands never overflow into their neighbours.
  const laneCounts = new Map<number, number>();
  if (computed) {
    for (const l of computed) {
      laneCounts.set(l.band, Math.max(laneCounts.get(l.band) ?? 0, l.lane + 1));
    }
  }

  const TOP_PAD = 10; // gap below the band label before the first lane
  const BOTTOM_PAD = 10;

  let y = 50;
  return PARADIGM_ORDER.map((id, index) => {
    const meta = BAND_META[id];
    let height = meta.height;
    if (computed) {
      const lanes = laneCounts.get(index) ?? 1;
      height = Math.max(48, TOP_PAD + lanes * config.laneHeight + BOTTOM_PAD);
    }
    const band: BandInfo = {
      id,
      label: meta.label,
      color: meta.color,
      height,
      y,
    };
    y += height + config.bandGap;
    return band;
  });
}

export { DEFAULT_CONFIG };
