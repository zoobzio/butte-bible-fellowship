import type { ArchLineKey, ArchLineConfig } from "~/types/arches";

/** Horizontal user-unit space, stretched to the viewport width. */
export const ARCH_VB_W = 1000;

/** px between switchback crests. */
export const ARCH_WAVE = 820;

/** Load-in draw duration. */
export const ARCH_INTRO_MS = 1700;

/**
 * Vertical shift of the whole track, as a fraction of the hero height.
 * The geometry is untouched — the same arch simply translates down so its
 * crown settles toward the bottom of the hero instead of the top.
 */
export const ARCH_Y_SHIFT = 0.6;

/**
 * How far the arch's feet overshoot the hero's bottom edge, as a fraction
 * of the hero height, so the load-in draw reads as covering the whole hero.
 */
export const ARCH_OVERSHOOT = 0.14;

/** The lines, in paint order. */
export const ARCH_LINE_KEYS: readonly ArchLineKey[] = ["A", "B"];

/** Per-line geometry, in ARCH_VB_W units. */
export const ARCH_CONFIGS: Record<ArchLineKey, ArchLineConfig> = {
  A: { legX: 690, crownX: 880, span: 330, drift: 300 },
  B: { legX: 780, crownX: 930, span: 210, drift: 430 },
};

/**
 * How far each line's reveal trails behind as the page scrolls, as a
 * fraction of its length at full scroll.
 */
export const ARCH_LAG: Record<ArchLineKey, number> = {
  A: 0,
  B: 0.04,
};

/** Upper bound on the fraction of a line the load-in draw may cover. */
export const ARCH_STOP_MAX = 0.95;

/** How far past the right edge a line starts, in ARCH_VB_W units. */
export const ARCH_START_OVERHANG = 90;

/** px the crown sits above the top of the hero box. */
export const ARCH_CROWN_LIFT = 6;

/**
 * Height of the arch's shoulder control points, as a fraction of the hero
 * box measured down from its top.
 */
export const ARCH_SHOULDER = 0.12;

/** Growth of a line's sideways drift with each successive switchback. */
export const ARCH_DRIFT_GROWTH = 0.32;

/** How far a switchback may travel past either edge, in ARCH_VB_W units. */
export const ARCH_BLEED = 140;

/**
 * Where a switchback's two control points sit along its descent, as
 * fractions of the distance between crests.
 */
export const ARCH_WAVE_C1 = 0.42;
export const ARCH_WAVE_C2 = 0.62;
