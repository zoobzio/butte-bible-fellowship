import { describe, expect, it, vi } from "vitest";

import { accessUntheme, useUntheme } from "#imports";
import theme from "@bbf/theme/config";
import { useAppearance } from "#layers/bbf/app/composables/appearance";
import { useSiteAppearance } from "~/composables/appearance";

const VIOLET = {
  colorSpace: "srgb",
  components: [0.48627, 0.22745, 0.92941],
  hex: "#7c3aed",
};

const STORED = {
  patch: { tokens: { "primary-600": VIOLET } },
  input: { color: "dark" },
};

const state = () => accessUntheme().config.value;

describe("useSiteAppearance", () => {
  it("reads how the site looks from the site's API, and lays it over the theme", async () => {
    const fetch = vi.fn(async () => STORED);
    vi.stubGlobal("$fetch", fetch);
    await useSiteAppearance().load();
    expect(fetch).toHaveBeenCalledExactlyOnceWith("/api/appearance");
    expect(useAppearance().site.value).toEqual(STORED);
    expect(useUntheme().resolve("primary-600")).toEqual(VIOLET);
    expect(state().input).toEqual({ ...theme.input, color: "dark" });
  });

  it("leaves the site as its theme says when nothing is set", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ patch: { tokens: {} }, input: {} })),
    );
    await useSiteAppearance().load();
    expect(useUntheme().resolve("primary-600")).toEqual(
      theme.theme.tokens["primary-600"].$value,
    );
    expect(state().input).toEqual(theme.input);
  });

  it("leaves the site as its theme says when the read fails, and does not fail the page", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("503");
      }),
    );
    await expect(useSiteAppearance().load()).resolves.toBeUndefined();
    expect(useAppearance().site.value).toBeNull();
    expect(state().patch).toEqual({});
    expect(state().input).toEqual(theme.input);
  });

  it("sets aside an answer that is not how the site looks", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => "<html>"),
    );
    await useSiteAppearance().load();
    expect(useAppearance().site.value).toBeNull();
    expect(state().patch).toEqual({});
  });
});
