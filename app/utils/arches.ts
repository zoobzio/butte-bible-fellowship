/**
 * Pure geometry for the scroll-drawn arch lines: one continuous SVG path
 * per line — an arch anchored to the hero box, then switchbacks descending
 * to the page foot. Authored in real pixels against measured boxes, so the
 * arch always lands inside the hero and the switchbacks keep a constant
 * rhythm no matter how long the page is.
 */

/** Horizontal user-unit space, stretched to the viewport width. */
export const ARCH_VB_W = 1000;

/** px between switchback crests. */
export const ARCH_WAVE = 820;

/** One line's geometry, in ARCH_VB_W units. */
export interface ArchLineConfig {
  legX: number;
  crownX: number;
  span: number;
  drift: number;
}

export interface ArchLinePath {
  /** The full path: arch plus switchbacks down to endY. */
  d: string;
  /** The arch-only prefix, for measuring where the load-in draw settles. */
  arch: string;
}

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
  const crownY = top + (bottom - top) * 0.12;
  let d =
    `M ${ARCH_VB_W + 90} ${bottom.toFixed(1)}` +
    ` C ${ARCH_VB_W + 90} ${crownY.toFixed(1)}` +
    ` ${cfg.crownX} ${(top - 6).toFixed(1)}` +
    ` ${cfg.legX} ${(top - 6).toFixed(1)}` +
    ` C ${cfg.legX - cfg.span} ${(top - 6).toFixed(1)}` +
    ` ${cfg.legX - cfg.span} ${crownY.toFixed(1)}` +
    ` ${cfg.legX - cfg.span} ${bottom.toFixed(1)}`;
  const arch = d;

  // Switchbacks: alternate sides, drifting outward as they descend.
  let x = cfg.legX - cfg.span;
  let y = bottom;
  let side = -1;
  let i = 0;
  while (y < endY) {
    const ny = Math.min(endY, y + ARCH_WAVE);
    const spread = cfg.drift * (1 + i * 0.32);
    const nx = Math.max(
      -140,
      Math.min(ARCH_VB_W + 140, cfg.legX - cfg.span + side * spread),
    );
    const c1 = y + (ny - y) * 0.42;
    const c2 = y + (ny - y) * 0.62;
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
