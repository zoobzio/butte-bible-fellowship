import type { ArchLineConfig } from "~/types/arches";

import { describe, expect, it } from "vitest";

import {
  ARCH_BLEED,
  ARCH_CROWN_LIFT,
  ARCH_OVERSHOOT,
  ARCH_START_OVERHANG,
  ARCH_STOP_MAX,
  ARCH_VB_W,
  ARCH_WAVE,
  ARCH_Y_SHIFT,
} from "~/constants/arches";
import {
  archBounds,
  archReveal,
  archSignature,
  archStop,
  describeArchLine,
} from "~/utils/arches";

const CONFIG: ArchLineConfig = { legX: 700, crownX: 880, span: 300, drift: 300 };

/** The end point of every curve in a path, in order. */
const curveEnds = (d: string) =>
  d
    .split(" C ")
    .slice(1)
    .map((curve) => {
      const numbers = curve.trim().split(/\s+/).map(Number);
      return { x: numbers[4]!, y: numbers[5]! };
    });

describe("archBounds", () => {
  it("moves the hero rect into document space and shifts it down", () => {
    const { top } = archBounds({ top: 100, bottom: 600, height: 500 }, 0);
    expect(top).toBe(100 + 500 * ARCH_Y_SHIFT);
  });

  it("adds the scroll offset", () => {
    const rect = { top: -200, bottom: 300, height: 500 };
    const atRest = archBounds({ top: 100, bottom: 600, height: 500 }, 0);
    expect(archBounds(rect, 300)).toEqual(atRest);
  });

  it("overshoots the bottom edge by a share of the hero height", () => {
    const { top, bottom } = archBounds({ top: 0, bottom: 500, height: 500 }, 0);
    expect(bottom - top).toBeCloseTo(500 * (1 + ARCH_OVERSHOOT));
  });
});

describe("describeArchLine", () => {
  it("starts past the right edge at the bottom of the box", () => {
    const { d } = describeArchLine(100, 600, 600, CONFIG);
    expect(d.startsWith(`M ${ARCH_VB_W + ARCH_START_OVERHANG} 600.0 `)).toBe(
      true,
    );
  });

  it("crowns just above the box and lands a span left of the leg", () => {
    const [crown, foot] = curveEnds(describeArchLine(100, 600, 600, CONFIG).d);
    expect(crown).toEqual({ x: CONFIG.legX, y: 100 - ARCH_CROWN_LIFT });
    expect(foot).toEqual({ x: CONFIG.legX - CONFIG.span, y: 600 });
  });

  it("is only the arch when the page ends at the box", () => {
    const { d, arch } = describeArchLine(100, 600, 600, CONFIG);
    expect(d).toBe(arch);
    expect(curveEnds(d)).toHaveLength(2);
  });

  it("keeps the arch as the prefix of the full path", () => {
    const { d, arch } = describeArchLine(100, 600, 4000, CONFIG);
    expect(d.startsWith(arch)).toBe(true);
    expect(d.length).toBeGreaterThan(arch.length);
  });

  it("adds one switchback per wave down to the end of the page", () => {
    const endY = 600 + ARCH_WAVE * 2.5;
    const switchbacks = curveEnds(describeArchLine(100, 600, endY, CONFIG).d).slice(2);
    expect(switchbacks.map((point) => point.y)).toEqual([
      600 + ARCH_WAVE,
      600 + ARCH_WAVE * 2,
      endY,
    ]);
  });

  it("alternates sides, starting to the left", () => {
    const origin = CONFIG.legX - CONFIG.span;
    const switchbacks = curveEnds(describeArchLine(100, 600, 4000, CONFIG).d).slice(2);
    expect(switchbacks.map((point) => Math.sign(point.x - origin))).toEqual([
      -1, 1, -1, 1, -1,
    ]);
  });

  it("never drifts further than the bleed past either edge", () => {
    const wide = { ...CONFIG, drift: 5000 };
    const switchbacks = curveEnds(describeArchLine(100, 600, 4000, wide).d).slice(2);
    expect(switchbacks.map((point) => point.x)).toEqual([
      -ARCH_BLEED,
      ARCH_VB_W + ARCH_BLEED,
      -ARCH_BLEED,
      ARCH_VB_W + ARCH_BLEED,
      -ARCH_BLEED,
    ]);
  });

  it("returns the same path for the same inputs", () => {
    expect(describeArchLine(100, 600, 4000, CONFIG)).toEqual(
      describeArchLine(100, 600, 4000, CONFIG),
    );
  });
});

describe("archStop", () => {
  it("is the arch's share of the whole line", () => {
    expect(archStop(250, 1000)).toBe(0.25);
  });

  it("is capped so the line is never fully drawn on load", () => {
    expect(archStop(1000, 1000)).toBe(ARCH_STOP_MAX);
  });
});

describe("archReveal", () => {
  it("shows nothing before the intro starts", () => {
    expect(archReveal(0.4, 0.7, 0, 0.04)).toBe(0);
  });

  it("settles at the stop at the top of the page", () => {
    expect(archReveal(0.4, 0, 1, 0.04)).toBe(0.4);
  });

  it("shows the whole line at the foot of the page", () => {
    expect(archReveal(0.4, 1, 1, 0)).toBe(1);
  });

  it("grows with scroll progress", () => {
    expect(archReveal(0.4, 0.5, 1, 0)).toBeCloseTo(0.7);
  });

  it("scales with the intro", () => {
    expect(archReveal(0.4, 0, 0.5, 0)).toBe(0.2);
  });

  it("holds a lagging line back as the page scrolls", () => {
    expect(archReveal(0.4, 1, 1, 0.04)).toBeCloseTo(0.96);
    expect(archReveal(0.4, 0, 1, 0.04)).toBe(0.4);
  });

  it("never goes negative", () => {
    expect(archReveal(0, 1, 1, 2)).toBe(0);
  });
});

describe("archSignature", () => {
  it("ignores sub-pixel changes", () => {
    expect(archSignature(500.2, 3000.4, 1280)).toBe(
      archSignature(499.8, 2999.6, 1280),
    );
  });

  it("changes when the hero, footer or viewport moves", () => {
    const base = archSignature(500, 3000, 1280);
    expect(archSignature(501, 3000, 1280)).not.toBe(base);
    expect(archSignature(500, 3001, 1280)).not.toBe(base);
    expect(archSignature(500, 3000, 1281)).not.toBe(base);
  });
});
