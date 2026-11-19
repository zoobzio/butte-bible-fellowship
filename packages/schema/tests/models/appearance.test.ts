import { modifiers } from "@bbf/theme";
import { seeds } from "@bbf/theme/seeds";
import { describe, expect, it } from "vitest";

import {
  APPEARANCE_MODIFIERS,
  APPEARANCE_RAMPS,
  appearance,
  appearanceInput,
  appearanceRecord,
  appearanceSeeds,
  seed,
} from "../../src/models/appearance";

const UPDATED = "2026-11-19T18:00:00.000Z";

describe("the theme's own names", () => {
  it("are the eight ramps the theme seeds, in its order", () => {
    expect(APPEARANCE_RAMPS).toEqual([
      "primary",
      "secondary",
      "tertiary",
      "error",
      "success",
      "warning",
      "neutral",
      "neutral-variant",
    ]);
    expect(APPEARANCE_RAMPS).toEqual(Object.keys(seeds));
  });

  it("are the modifiers the theme composes, in its order", () => {
    expect(APPEARANCE_MODIFIERS).toEqual([
      "color",
      "vibrancy",
      "contrast",
      "text",
      "density",
      "radius",
      "depth",
      "motion",
    ]);
    expect(APPEARANCE_MODIFIERS).toEqual(Object.keys(modifiers));
  });
});

describe("seed", () => {
  it("is six hex digits after a hash, kept in lowercase", () => {
    expect(seed.parse("#0a68ff")).toBe("#0a68ff");
    expect(seed.parse("#0A68FF")).toBe("#0a68ff");
  });

  it("is nothing else: a name, a short code, a code with alpha, or CSS", () => {
    for (const value of [
      "blue",
      "#06f",
      "0a68ff",
      "#0a68ff80",
      "#0a68fg",
      "#0a68ff; } body { display: none",
      "",
    ]) {
      expect(seed.safeParse(value).success).toBe(false);
    }
  });

  it("accepts every seed of the theme", () => {
    for (const value of Object.values(seeds)) {
      expect(seed.parse(value)).toBe(value);
    }
  });
});

describe("appearanceSeeds", () => {
  it("holds a color for any of the ramps, and may hold none", () => {
    expect(appearanceSeeds.parse({})).toEqual({});
    expect(
      appearanceSeeds.parse({
        primary: "#7C3AED",
        "neutral-variant": "#85776d",
      }),
    ).toEqual({ primary: "#7c3aed", "neutral-variant": "#85776d" });
  });

  it("drops what is no ramp of the palette, and refuses what is no color", () => {
    expect(appearanceSeeds.parse({ accent: "#7c3aed" })).toEqual({});
    expect(appearanceSeeds.safeParse({ primary: "purple" }).success).toBe(
      false,
    );
  });
});

describe("appearanceInput", () => {
  it("holds a context for any of the modifiers, and may hold none", () => {
    expect(appearanceInput.parse({})).toEqual({});
    expect(appearanceInput.parse({ color: "dark", text: "lg" })).toEqual({
      color: "dark",
      text: "lg",
    });
  });

  it("holds each modifier to its own contexts", () => {
    for (const [modifier, contexts] of Object.entries(modifiers)) {
      for (const context of contexts) {
        expect(appearanceInput.parse({ [modifier]: context })).toEqual({
          [modifier]: context,
        });
      }
    }
    expect(appearanceInput.safeParse({ color: "lg" }).success).toBe(false);
    expect(appearanceInput.safeParse({ text: "dark" }).success).toBe(false);
  });

  it("drops what is no modifier of the theme", () => {
    expect(appearanceInput.parse({ mood: "calm" })).toEqual({});
  });
});

describe("appearanceRecord", () => {
  it("is the seeds, the modifiers and when they were last changed", () => {
    const record = {
      seeds: { primary: "#7c3aed" },
      input: { color: "dark" },
      updatedAt: UPDATED,
    };
    expect(appearanceRecord.parse(record)).toEqual(record);
    expect(
      appearanceRecord.parse({ seeds: {}, input: {}, updatedAt: UPDATED }),
    ).toEqual({ seeds: {}, input: {}, updatedAt: UPDATED });
  });

  it("needs all three", () => {
    expect(appearanceRecord.safeParse({ seeds: {}, input: {} }).success).toBe(
      false,
    );
    expect(
      appearanceRecord.safeParse({ input: {}, updatedAt: UPDATED }).success,
    ).toBe(false);
  });
});

describe("appearance", () => {
  it("carries the patch and the modifiers as they were stored: the site holds them to its theme", () => {
    const stored = {
      patch: { tokens: { "primary-500": { hex: "#8b5cf6" } } },
      input: { color: "dark", gone: "context" },
    };
    expect(appearance.parse(stored)).toEqual(stored);
    expect(appearance.parse({ patch: {}, input: {} })).toEqual({
      patch: {},
      input: {},
    });
  });

  it("is two records, whatever they hold", () => {
    expect(appearance.safeParse({ patch: [], input: {} }).success).toBe(false);
    expect(appearance.safeParse({ patch: {} }).success).toBe(false);
  });
});
