import { describe, expect, it, vi } from "vitest";

import { useUntheme } from "#imports";
import plugin from "~/plugins/appearance.server";

const VIOLET = {
  colorSpace: "srgb",
  components: [0.48627, 0.22745, 0.92941],
  hex: "#7c3aed",
};

describe("the appearance plugin", () => {
  it("runs after the theme's own, which has read the visitor's cookies by then", () => {
    expect(plugin).toMatchObject({
      name: "appearance",
      dependsOn: ["untheme"],
    });
  });

  it("lays what was set over the theme before anything renders", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({
        patch: { tokens: { "primary-600": VIOLET } },
        input: {},
      })),
    );
    await plugin.setup();
    expect(useUntheme().resolve("primary-600")).toEqual(VIOLET);
  });
});
