import { afterEach, describe, expect, it, vi } from "vitest";

import { toSeedPatch } from "@bbf/utils";
import { service } from "@bbf/nuxt/testing/bezoar";
import { useAppearance } from "~~/server/composables/appearance";

const ROW = {
  seeds: { primary: "#7c3aed" } as unknown,
  input: { color: "dark" } as unknown,
  updated_at: new Date("2026-11-19T18:00:00Z"),
};

const RECORD = {
  seeds: { primary: "#7c3aed" },
  input: { color: "dark" },
  updatedAt: "2026-11-19T18:00:00.000Z",
};

let row: typeof ROW | null = ROW;

const fetched = vi.fn(async () => row);
const updated = vi.fn(async (_args: object) =>
  row === null ? null : { updated_at: row.updated_at },
);

Object.assign(service, {
  admin: {
    appearance: { fetch: { first: fetched }, update: { first: updated } },
  },
});

afterEach(() => {
  row = ROW;
  fetched.mockClear();
  updated.mockClear();
});

describe("useAppearance", () => {
  it("fetches how the site looks, or nothing should its row be missing", async () => {
    expect(await useAppearance().fetch()).toEqual(RECORD);
    expect(fetched).toHaveBeenCalledWith();
    row = null;
    expect(await useAppearance().fetch()).toBeNull();
  });

  it("reads as nothing set what no longer fits the theme", async () => {
    row = { ...ROW, seeds: { primary: "purple" }, input: { color: "sepia" } };
    expect(await useAppearance().fetch()).toEqual({
      ...RECORD,
      seeds: {},
      input: {},
    });
  });

  it("writes the seeds and the modifiers with the patch the seeds come to, and hands back the record", async () => {
    expect(
      await useAppearance().update({
        seeds: { secondary: "#0ea5e9" },
        input: { text: "lg" },
      }),
    ).toEqual(RECORD);
    const patch = toSeedPatch({ secondary: "#0ea5e9" });
    expect(Object.keys(patch.tokens)).toHaveLength(33);
    expect(updated).toHaveBeenCalledExactlyOnceWith({
      seeds: { secondary: "#0ea5e9" },
      patch,
      input: { text: "lg" },
    });
    expect(fetched).toHaveBeenCalledTimes(1);
  });

  it("writes nothing over the theme when nothing is set", async () => {
    await useAppearance().update({ seeds: {}, input: {} });
    expect(updated).toHaveBeenCalledWith({
      seeds: {},
      patch: { tokens: {} },
      input: {},
    });
  });

  it("hands back nothing should its row be missing", async () => {
    row = null;
    expect(await useAppearance().update({ seeds: {}, input: {} })).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });
});
