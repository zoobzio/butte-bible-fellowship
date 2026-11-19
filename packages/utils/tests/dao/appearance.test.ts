import { appearanceBody } from "@bbf/schema";
import { theme } from "@bbf/theme/config";
import { seeds } from "@bbf/theme/seeds";
import { describe, expect, it } from "vitest";
import { defineSchema, makeUntheme } from "untheme";

import { toAppearanceArguments, toSeedPatch } from "../../src/dao/appearance";

const schema = defineSchema(theme);

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

describe("toSeedPatch", () => {
  it("is no override at all with no seed set", () => {
    expect(toSeedPatch({})).toEqual({ tokens: {} });
  });

  it("draws an accent out into its eleven stops, and its muted and vivid columns", () => {
    const { tokens } = toSeedPatch({ primary: "#7c3aed" });
    expect(Object.keys(tokens)).toEqual(
      ["primary", "primary-muted", "primary-vivid"].flatMap((column) =>
        STOPS.map((stop) => `${column}-${stop}`),
      ),
    );
    expect(tokens["primary-500"]).toEqual({
      colorSpace: "srgb",
      components: expect.any(Array),
      hex: expect.stringMatching(/^#[0-9a-f]{6}$/),
    });
  });

  it("draws a neutral out into its eleven stops alone", () => {
    const { tokens } = toSeedPatch({ "neutral-variant": "#85776d" });
    expect(Object.keys(tokens)).toEqual(
      STOPS.map((stop) => `neutral-variant-${stop}`),
    );
  });

  it("leaves a ramp with no seed to the theme", () => {
    const { tokens } = toSeedPatch({ primary: undefined, error: "#b91c1c" });
    expect(
      Object.keys(tokens).every((token) => token.startsWith("error")),
    ).toBe(true);
  });

  it("is a patch of the theme, whatever the seeds", () => {
    const every = Object.fromEntries(
      Object.keys(seeds).map((ramp) => [ramp, "#7c3aed"]),
    );
    const patch = toSeedPatch(every);
    expect(Object.keys(patch.tokens)).toHaveLength(220);
    expect(schema.check.patch(patch)).toBe(true);
    expect(schema.check.patch(toSeedPatch({}))).toBe(true);
  });

  it("makes of the theme's own seeds the theme's own ramps: the generator is the one the palette was built with", () => {
    const { tokens } = toSeedPatch(seeds);
    expect(Object.keys(tokens)).toHaveLength(220);
    for (const [token, value] of Object.entries(tokens)) {
      expect(
        (theme.tokens as Record<string, { $value: unknown }>)[token]?.$value,
        token,
      ).toMatchObject({ hex: value.hex });
    }
  });

  it("moves every role that reads the ramp, in every scheme", () => {
    const config = { patch: {}, input: { ...makeInput() } };
    const untheme = makeUntheme(theme, config);
    const before = {
      light: untheme.resolve("primary"),
      dark: (untheme.swap("color", "dark"), untheme.resolve("primary")),
    };
    untheme.update(toSeedPatch({ primary: "#7c3aed" }));
    const dark = untheme.resolve("primary");
    untheme.swap("color", "light");
    const light = untheme.resolve("primary");
    expect(light).not.toEqual(before.light);
    expect(dark).not.toEqual(before.dark);
    expect(light).not.toEqual(dark);
    // A ramp that was not set stays the theme's.
    expect(untheme.resolve("secondary")).toEqual(
      makeUntheme(theme, { patch: {}, input: makeInput() }).resolve(
        "secondary",
      ),
    );
  });
});

function makeInput() {
  return {
    color: "light",
    vibrancy: "balanced",
    contrast: "default",
    text: "md",
    density: "default",
    radius: "default",
    depth: "default",
    motion: "default",
  } as const;
}

describe("toAppearanceArguments", () => {
  it("writes the seeds and the modifiers as they were set, and the patch the seeds come to", () => {
    const body = appearanceBody.parse({
      seeds: { primary: "#7C3AED" },
      input: { color: "dark" },
    });
    expect(toAppearanceArguments(body)).toEqual({
      seeds: { primary: "#7c3aed" },
      patch: toSeedPatch({ primary: "#7c3aed" }),
      input: { color: "dark" },
    });
  });

  it("writes nothing over the theme when nothing is set", () => {
    expect(
      toAppearanceArguments(appearanceBody.parse({ seeds: {}, input: {} })),
    ).toEqual({ seeds: {}, patch: { tokens: {} }, input: {} });
  });
});
