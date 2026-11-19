import type { AppearanceRecord } from "@bbf/schema/types";

import { appearanceBody, appearanceForm } from "@bbf/schema";
import { input } from "@bbf/theme/config";
import { seeds } from "@bbf/theme/seeds";
import { describe, expect, it } from "vitest";

import { toAppearanceBody, toAppearanceForm } from "../../src/vm/appearance";

const UPDATED = "2026-11-19T18:00:00.000Z";

const BLANK: AppearanceRecord = { seeds: {}, input: {}, updatedAt: UPDATED };

const SET: AppearanceRecord = {
  seeds: { primary: "#7c3aed", neutral: "#6b7280" },
  input: { color: "dark", text: "lg" },
  updatedAt: UPDATED,
};

describe("toAppearanceForm", () => {
  it("holds the theme's own seeds and modifiers where the record sets none", () => {
    const form = toAppearanceForm(BLANK);
    expect(form).toEqual({ ...seeds, ...input });
    expect(appearanceForm.parse(form)).toEqual(form);
  });

  it("holds what the record sets over the theme's own", () => {
    expect(toAppearanceForm(SET)).toEqual({
      ...seeds,
      ...input,
      primary: "#7c3aed",
      neutral: "#6b7280",
      color: "dark",
      text: "lg",
    });
  });

  it("keeps the theme's own for a member the record names and leaves empty", () => {
    expect(
      toAppearanceForm({
        ...BLANK,
        seeds: { primary: undefined },
        input: { color: undefined },
      }),
    ).toEqual({ ...seeds, ...input });
  });
});

describe("toAppearanceBody", () => {
  it("writes nothing of a form left as the theme has it", () => {
    const body = toAppearanceBody(toAppearanceForm(BLANK));
    expect(body).toEqual({ seeds: {}, input: {} });
    expect(appearanceBody.parse(body)).toEqual(body);
  });

  it("writes only what differs from the theme", () => {
    expect(toAppearanceBody(toAppearanceForm(SET))).toEqual({
      seeds: SET.seeds,
      input: SET.input,
    });
  });

  it("leaves out a ramp or a modifier put back to the theme's own, however the color is cased", () => {
    expect(
      toAppearanceBody({
        ...toAppearanceForm(SET),
        primary: seeds.primary.toUpperCase(),
        color: input.color,
      }),
    ).toEqual({ seeds: { neutral: "#6b7280" }, input: { text: "lg" } });
  });

  it("writes a color in lowercase", () => {
    expect(
      toAppearanceBody({ ...toAppearanceForm(BLANK), primary: "#7C3AED" })
        .seeds,
    ).toEqual({ primary: "#7c3aed" });
  });
});
