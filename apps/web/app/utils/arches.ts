import type {
  ArchBounds,
  ArchLinePath,
  ArchLineConfig,
} from "~/types/arches";
import {
  ARCH_BLEED,
  ARCH_CROWN_LIFT,
  ARCH_DRIFT_GROWTH,
  ARCH_OVERSHOOT,
  ARCH_SHOULDER,
  ARCH_START_OVERHANG,
  ARCH_STOP_MAX,
  ARCH_VB_W,
  ARCH_WAVE,
  ARCH_WAVE_C1,
  ARCH_WAVE_C2,
  ARCH_Y_SHIFT,
} from "~/constants/arches";

/**
 * The box the arches are drawn against: the hero's viewport rect moved into
 * document px, shifted down by ARCH_Y_SHIFT, with the bottom edge overshot
 * by ARCH_OVERSHOOT.
 */
export const archBounds = (
  rect: Pick<DOMRect, "top" | "bottom" | "height">,
  scrollY: number,
): ArchBounds => {
  const shift = rect.height * ARCH_Y_SHIFT;
  const top = rect.top + scrollY + shift;
  const bottom = rect.bottom + scrollY + shift;
  return { top, bottom: bottom + (bottom - top) * ARCH_OVERSHOOT };
};

/**
 * Describes one line from the hero box (top/bottom, in document px) down
 * to endY. Pure: same inputs, same path.
 */
export const describeArchLine = (
  top: number,
  bottom: number,
  endY: number,
  cfg: ArchLineConfig,
): ArchLinePath => {
  const startX = ARCH_VB_W + ARCH_START_OVERHANG;
  const crownTop = top - ARCH_CROWN_LIFT;
  const shoulderY = top + (bottom - top) * ARCH_SHOULDER;
  let d =
    `M ${startX} ${bottom.toFixed(1)}` +
    ` C ${startX} ${shoulderY.toFixed(1)}` +
    ` ${cfg.crownX} ${crownTop.toFixed(1)}` +
    ` ${cfg.legX} ${crownTop.toFixed(1)}` +
    ` C ${cfg.legX - cfg.span} ${crownTop.toFixed(1)}` +
    ` ${cfg.legX - cfg.span} ${shoulderY.toFixed(1)}` +
    ` ${cfg.legX - cfg.span} ${bottom.toFixed(1)}`;
  const arch = d;

  // Switchbacks: alternate sides, drifting outward as they descend.
  let x = cfg.legX - cfg.span;
  let y = bottom;
  let side = -1;
  let i = 0;
  while (y < endY) {
    const ny = Math.min(endY, y + ARCH_WAVE);
    const spread = cfg.drift * (1 + i * ARCH_DRIFT_GROWTH);
    const nx = Math.max(
      -ARCH_BLEED,
      Math.min(ARCH_VB_W + ARCH_BLEED, cfg.legX - cfg.span + side * spread),
    );
    const c1 = y + (ny - y) * ARCH_WAVE_C1;
    const c2 = y + (ny - y) * ARCH_WAVE_C2;
    d +=
      ` C ${x.toFixed(0)} ${c1.toFixed(1)}` +
      ` ${nx.toFixed(0)} ${c2.toFixed(1)}` +
      ` ${nx.toFixed(0)} ${ny.toFixed(1)}`;
    x = nx;
    y = ny;
    side *= -1;
    i++;
  }
  return { d, arch };
};

/**
 * The fraction of a line the load-in draw settles at: the arch's share of
 * the full path, capped at ARCH_STOP_MAX.
 */
export const archStop = (archLength: number, totalLength: number): number =>
  Math.min(ARCH_STOP_MAX, archLength / totalLength);

/**
 * The fraction of a line to show: from `stop` at the top of the page to the
 * whole line at its foot, scaled by the load-in `intro` and held back by
 * the line's `lag`.
 */
export const archReveal = (
  stop: number,
  progress: number,
  intro: number,
  lag: number,
): number =>
  Math.max(0, (stop + (1 - stop) * progress) * intro - lag * intro * progress);

/**
 * A key for the measurements the arch layout depends on, so a relayout can
 * be skipped when none of them moved.
 */
export const archSignature = (
  heroHeight: number,
  footerTop: number,
  viewportWidth: number,
): string =>
  `${Math.round(heroHeight)}/${Math.round(footerTop)}/${viewportWidth}`;
