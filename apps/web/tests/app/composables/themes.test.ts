import { afterEach, describe, expect, it, vi } from "vitest";

import { useUntheme } from "#imports";
import { useThemes } from "~/composables/themes";

const primary = () => useUntheme().resolve("primary-600");

/** A browser's view transition, as far as the helper reaches into it. */
const viewTransition = () =>
  vi.fn((change: () => void | Promise<void>) => ({
    updateCallbackDone: Promise.resolve(change()),
  }));

afterEach(() => {
  delete (document as { startViewTransition?: unknown }).startViewTransition;
});

describe("useThemes", () => {
  it("starts with the site's theme active", () => {
    expect(useThemes().active.value).toBe("bbf");
  });

  it("lists the site's theme and every aurora theme, by name", () => {
    const { themes } = useThemes();
    expect(themes.length).toBe(32);
    const ids = themes.map((theme) => theme.id);
    expect(ids).toContain("bbf");
    expect(ids).toContain("nord");
    const names = themes.map((theme) => theme.name);
    expect(names).toContain("Butte Bible Fellowship");
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("applies a chosen theme's ramps", async () => {
    const { active, choose } = useThemes();
    const before = primary();
    await choose("nord");
    expect(active.value).toBe("nord");
    expect(useUntheme().theme().id).toBe("nord");
    expect(useUntheme().config.patch.id).toBe("nord");
    expect(primary()).not.toEqual(before);
  });

  it("returns to the site's colors through the site's own entry", async () => {
    const { active, choose } = useThemes();
    const before = primary();
    await choose("nord");
    await choose("bbf");
    expect(active.value).toBe("bbf");
    expect(primary()).toEqual(before);
  });

  it("shares one selection across callers", async () => {
    await useThemes().choose("nord");
    expect(useThemes().active.value).toBe("nord");
  });

  it("cross-fades through a view transition where the browser has one", async () => {
    const start = viewTransition();
    Object.assign(document, { startViewTransition: start });
    await useThemes().choose("nord");
    expect(start).toHaveBeenCalledOnce();
    expect(useThemes().active.value).toBe("nord");
  });

  it("changes nothing when the chosen theme is already active", async () => {
    const start = viewTransition();
    Object.assign(document, { startViewTransition: start });
    await useThemes().choose("bbf");
    expect(start).not.toHaveBeenCalled();
  });
});
