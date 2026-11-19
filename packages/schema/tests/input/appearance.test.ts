import config from "@bbf/theme/config";
import { seeds } from "@bbf/theme/seeds";
import { describe, expect, it } from "vitest";

import { appearanceBody, appearanceForm } from "../../src/input/appearance";

/** The form with nothing changed: every ramp and modifier as the theme has it. */
const DEFAULTS = { ...seeds, ...config.input };

const form = (value: unknown) =>
  appearanceForm
    .safeParse(value)
    .error?.issues.map((issue) => issue.path.join(".")) ?? [];

describe("appearanceBody", () => {
  it("is the seeds and the modifiers that are set, and may set none", () => {
    expect(appearanceBody.parse({ seeds: {}, input: {} })).toEqual({
      seeds: {},
      input: {},
    });
    expect(
      appearanceBody.parse({
        seeds: { primary: "#7C3AED" },
        input: { color: "dark" },
      }),
    ).toEqual({ seeds: { primary: "#7c3aed" }, input: { color: "dark" } });
  });

  it("needs both, and holds each to the theme", () => {
    expect(appearanceBody.safeParse({ seeds: {} }).success).toBe(false);
    expect(appearanceBody.safeParse({ input: {} }).success).toBe(false);
    expect(
      appearanceBody.safeParse({ seeds: { primary: "purple" }, input: {} })
        .success,
    ).toBe(false);
    expect(
      appearanceBody.safeParse({ seeds: {}, input: { color: "sepia" } })
        .success,
    ).toBe(false);
  });

  it("carries no patch: that is made from the seeds where they are saved", () => {
    expect(
      appearanceBody.parse({
        seeds: {},
        input: {},
        patch: { tokens: { primary: "{error-600}" } },
      }),
    ).toEqual({ seeds: {}, input: {} });
  });
});

describe("appearanceForm", () => {
  it("holds a color for every ramp and a context for every modifier", () => {
    expect(appearanceForm.parse(DEFAULTS)).toEqual(DEFAULTS);
  });

  it("takes a color as it is typed: any case, with space around it", () => {
    expect(
      appearanceForm.parse({ ...DEFAULTS, primary: "  #7C3AED " }).primary,
    ).toBe("#7c3aed");
  });

  it("names the field that is no color, or no context of its modifier", () => {
    expect(form({ ...DEFAULTS, primary: "purple" })).toEqual(["primary"]);
    expect(form({ ...DEFAULTS, secondary: "" })).toEqual(["secondary"]);
    expect(form({ ...DEFAULTS, color: "sepia" })).toEqual(["color"]);
    const { neutral: _, motion: __, ...partial } = DEFAULTS;
    expect(form(partial)).toEqual(["neutral", "motion"]);
  });

  it("says what a color is to be", () => {
    expect(
      appearanceForm.safeParse({ ...DEFAULTS, primary: "purple" }).error
        ?.issues[0]?.message,
    ).toBe("A color as a hex code, such as #0a68ff.");
  });
});
