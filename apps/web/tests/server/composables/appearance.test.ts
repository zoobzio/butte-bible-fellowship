import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useAppearance } from "~~/server/composables/appearance";

const ROW = {
  patch: { tokens: { "primary-600": { hex: "#7c3aed" } } } as unknown,
  input: { color: "dark" } as unknown,
};

const first = vi.fn(async (): Promise<typeof ROW | null> => ROW);

Object.assign(service, { web: { appearance: { fetch: { first } } } });

afterEach(() => {
  first.mockClear();
});

describe("useAppearance", () => {
  it("reads the patch and the modifiers as they were stored", async () => {
    expect(await useAppearance().fetch()).toEqual(ROW);
    expect(first).toHaveBeenCalledWith();
  });

  it("reads nothing over the theme when the table holds no row", async () => {
    first.mockResolvedValueOnce(null);
    expect(await useAppearance().fetch()).toEqual({ patch: {}, input: {} });
  });

  it("reads nothing over the theme from a row that holds no records", async () => {
    first.mockResolvedValueOnce({ patch: null, input: {} });
    expect(await useAppearance().fetch()).toEqual({ patch: {}, input: {} });
  });
});
