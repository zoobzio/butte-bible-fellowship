import { describe, expect, it } from "vitest";

import { accessUntheme, useUntheme } from "#imports";
import theme from "@bbf/theme/config";
import { useAppearance } from "#layers/bbf/app/composables/appearance";
import { useThemes } from "#layers/bbf/app/composables/themes";

const VIOLET = {
  colorSpace: "srgb",
  components: [0.48627, 0.22745, 0.92941],
  hex: "#7c3aed",
};

/** What whoever runs the site set: a primary of their own, and dark first. */
const STORED = {
  patch: { tokens: { "primary-600": VIOLET } },
  input: { color: "dark", text: "lg" },
};

const primary = () => useUntheme().resolve("primary-600");

const state = () => accessUntheme().config.value;

describe("useAppearance", () => {
  it("holds nothing until something is adopted, and changes nothing", () => {
    const { site, restore } = useAppearance();
    expect(site.value).toBeNull();
    restore();
    expect(state().patch).toEqual({});
    expect(state().input).toEqual(theme.input);
  });

  it("lays what was set over the theme for a visitor who has chosen nothing", () => {
    const { site, adopt } = useAppearance();
    adopt(STORED);
    expect(site.value).toEqual(STORED);
    expect(primary()).toEqual(VIOLET);
    expect(state().input).toEqual({
      ...theme.input,
      color: "dark",
      text: "lg",
    });
    // The site's own theme is still the one applied.
    expect(useThemes().active.value).toBe("bbf");
    expect(state().patch.id).toBeUndefined();
  });

  it("keeps the site's defaults out of the visitor's cookies, so they go on following what is set", () => {
    useAppearance().adopt(STORED);
    const { cookies } = accessUntheme();
    expect(cookies.input.value).toBeNull();
    expect(cookies.key.value).toBeNull();
  });

  it("leaves every modifier as a visitor who has set one left it, and still lays the tokens over the site's theme", () => {
    const { cookies } = accessUntheme();
    const chosen = { ...theme.input, contrast: "high" as const };
    cookies.input.value = chosen;
    state().input = chosen;
    useAppearance().adopt(STORED);
    expect(state().input).toEqual(chosen);
    expect(primary()).toEqual(VIOLET);
  });

  it("leaves another theme a visitor has chosen as it is, and still starts them with the modifiers", async () => {
    await useUntheme().select("nord");
    const nord = primary();
    const { site, adopt } = useAppearance();
    adopt(STORED);
    expect(primary()).toEqual(nord);
    expect(state().patch.id).toBe("nord");
    expect(state().input.color).toBe("dark");
    // What was set is kept all the same, for when they come back.
    expect(site.value).toEqual(STORED);
  });

  it("lays the tokens over the site's own layer, for a visitor who chose it by name", async () => {
    await useUntheme().select("bbf");
    useAppearance().adopt(STORED);
    expect(state().patch.id).toBe("bbf");
    expect(primary()).toEqual(VIOLET);
    // What the layer binds and the site does not set stays.
    expect(useUntheme().resolve("primary-500")).toEqual(
      theme.theme.tokens["primary-500"].$value,
    );
  });

  it("puts what was set back when a visitor returns to the site's theme from another", async () => {
    const { adopt } = useAppearance();
    adopt(STORED);
    const { active, choose } = useThemes();
    await choose("nord");
    expect(primary()).not.toEqual(VIOLET);
    await choose("bbf");
    expect(active.value).toBe("bbf");
    expect(primary()).toEqual(VIOLET);
  });

  it("restores nothing over another theme", async () => {
    const { adopt, restore } = useAppearance();
    adopt(STORED);
    await useUntheme().select("nord");
    const nord = primary();
    restore();
    expect(primary()).toEqual(nord);
    expect(state().patch.id).toBe("nord");
  });

  it("carries a context's overrides as well as the tokens'", () => {
    const { adopt } = useAppearance();
    adopt({
      patch: { modifiers: { color: { dark: { primary: "{primary-200}" } } } },
      input: { color: "dark" },
    });
    expect(useUntheme().get("primary")).toBe("{primary-200}");
  });

  it("sets aside overrides that no longer fit the theme, and keeps the modifiers that do", () => {
    const { site, adopt } = useAppearance();
    adopt({
      patch: { tokens: { "primary-600": VIOLET, "accent-600": VIOLET } },
      input: { color: "dark", text: "huge", mood: "calm" },
    });
    expect(site.value).toEqual({ patch: {}, input: { color: "dark" } });
    expect(state().patch).toEqual({});
    expect(state().input).toEqual({ ...theme.input, color: "dark" });
  });

  it("sets aside a value that could break out of the stylesheet", () => {
    const { adopt } = useAppearance();
    adopt({
      patch: { tokens: { "primary-600": "red; } body { display: none" } },
      input: {},
    });
    expect(state().patch).toEqual({});
  });

  it("takes the tokens and the contexts of what was stored, and no identity or order with them", () => {
    const { site, adopt } = useAppearance();
    adopt({
      patch: { id: "nord", name: "Nord", tokens: { "primary-600": VIOLET } },
      input: {},
    });
    expect(site.value?.patch).toEqual({ tokens: { "primary-600": VIOLET } });
    expect(state().patch.id).toBeUndefined();
    expect(useThemes().active.value).toBe("bbf");
  });

  it("reads as nothing set what is no record at all", () => {
    const { site, adopt } = useAppearance();
    adopt({ patch: null, input: ["dark"] });
    expect(site.value).toEqual({ patch: {}, input: {} });
    expect(state().patch).toEqual({});
    expect(state().input).toEqual(theme.input);
  });
});
