import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUntheme } from "#imports";
import { useThemes } from "~/composables/themes";
import { stubCatalog } from "#test/support/catalog";

type Color = { hex: string };

const primary = () =>
  (useUntheme().config.theme.tokens["primary-600"].$value as Color).hex;

let fetch: ReturnType<typeof stubCatalog>;

beforeEach(() => {
  fetch = stubCatalog();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useThemes", () => {
  it("starts with no themes listed and the site's theme active", () => {
    const { themes, active } = useThemes();
    expect(themes.value).toEqual([]);
    expect(active.value).toBe("bbf");
  });

  it("lists the whole catalog, past the first page", async () => {
    const { themes, load } = useThemes();
    await load();
    expect(themes.value.length).toBe(32);
    const ids = themes.value.map((theme) => theme.id);
    expect(ids).toContain("bbf");
    expect(ids).toContain("nord");
    const names = themes.value.map((theme) => theme.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("lists once and shares the result across callers", async () => {
    await useThemes().load();
    const requests = fetch.mock.calls.length;
    const other = useThemes();
    await other.load();
    expect(fetch.mock.calls.length).toBe(requests);
    expect(other.themes.value.length).toBe(32);
  });

  it("applies a chosen theme's ramps", async () => {
    const { active, choose } = useThemes();
    const before = primary();
    await choose("nord");
    expect(active.value).toBe("nord");
    expect(primary()).not.toBe(before);
  });

  it("returns to the site's colors through the site's own entry", async () => {
    const { active, choose } = useThemes();
    const before = primary();
    await choose("nord");
    await choose("bbf");
    expect(active.value).toBe("bbf");
    expect(primary()).toBe(before);
  });

  it("requests nothing when the chosen theme is already active", async () => {
    await useThemes().choose("bbf");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("leaves the active theme standing on a miss", async () => {
    const { active, choose } = useThemes();
    await choose("no-such-theme");
    expect(active.value).toBe("bbf");
  });

  it("cross-fades through a view transition where the browser has one", async () => {
    const start = vi.fn((change: () => void) => change());
    Object.assign(document, { startViewTransition: start });
    try {
      await useThemes().choose("nord");
      expect(start).toHaveBeenCalledOnce();
      expect(useThemes().active.value).toBe("nord");
    } finally {
      delete (document as { startViewTransition?: unknown })
        .startViewTransition;
    }
  });
});
