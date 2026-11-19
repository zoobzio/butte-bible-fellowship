import { appearance, appearanceRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toAppearance, toAppearanceRecord } from "../../src/dto/appearance";

const UPDATED = new Date("2026-11-19T18:00:00Z");

describe("toAppearanceRecord", () => {
  it("reads the seeds and the modifiers that are set, as the schema accepts them", () => {
    const record = toAppearanceRecord({
      seeds: { primary: "#7c3aed" },
      input: { color: "dark" },
      updated_at: UPDATED,
    });
    expect(record).toEqual({
      seeds: { primary: "#7c3aed" },
      input: { color: "dark" },
      updatedAt: "2026-11-19T18:00:00.000Z",
    });
    expect(appearanceRecord.parse(record)).toEqual(record);
  });

  it("reads nothing set from the row as it is made", () => {
    expect(
      toAppearanceRecord({ seeds: {}, input: {}, updated_at: UPDATED }),
    ).toEqual({ seeds: {}, input: {}, updatedAt: "2026-11-19T18:00:00.000Z" });
  });

  it("reads as nothing set what no longer fits the theme, each on its own", () => {
    expect(
      toAppearanceRecord({
        seeds: { primary: "purple" },
        input: { color: "dark" },
        updated_at: UPDATED,
      }),
    ).toMatchObject({ seeds: {}, input: { color: "dark" } });
    expect(
      toAppearanceRecord({
        seeds: { primary: "#7c3aed" },
        input: { color: "sepia" },
        updated_at: UPDATED,
      }),
    ).toMatchObject({ seeds: { primary: "#7c3aed" }, input: {} });
    expect(
      toAppearanceRecord({ seeds: null, input: [], updated_at: UPDATED }),
    ).toMatchObject({ seeds: {}, input: {} });
  });
});

describe("toAppearance", () => {
  it("reads the patch and the modifiers as they were stored", () => {
    const row = {
      patch: { tokens: { "primary-500": { hex: "#8b5cf6" } } },
      input: { color: "dark" },
    };
    expect(toAppearance(row)).toEqual(row);
    expect(appearance.parse(toAppearance(row))).toEqual(row);
  });

  it("reads nothing over the theme from a row that holds no records", () => {
    expect(toAppearance({ patch: null, input: {} })).toEqual({
      patch: {},
      input: {},
    });
    expect(toAppearance({ patch: {}, input: "dark" })).toEqual({
      patch: {},
      input: {},
    });
  });
});
