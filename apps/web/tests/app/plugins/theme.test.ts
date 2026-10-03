import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCookie, useUntheme } from "#imports";
import plugin from "~/plugins/theme";
import { stubCatalog } from "#test/support/catalog";

const setup = (plugin as unknown as { setup: () => Promise<void> }).setup;

let fetch: ReturnType<typeof stubCatalog>;

beforeEach(() => {
  fetch = stubCatalog();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("theme plugin", () => {
  it("runs after the untheme plugin", () => {
    expect(plugin).toMatchObject({ dependsOn: ["untheme"] });
  });

  it("requests nothing without a stored theme", async () => {
    await setup();
    expect(fetch).not.toHaveBeenCalled();
    expect(useUntheme().config.theme.id).toBe("bbf");
  });

  it("requests nothing when the stored theme is the one booted", async () => {
    useCookie("untheme-key").value = "bbf";
    await setup();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("applies the stored theme once its layer arrives", async () => {
    useCookie("untheme-key").value = "nord";
    await setup();
    await vi.waitFor(() => expect(useUntheme().config.theme.id).toBe("nord"));
  });

  it("clears a stored theme the catalog no longer serves", async () => {
    const key = useCookie("untheme-key");
    key.value = "no-such-theme";
    await setup();
    await vi.waitFor(() => expect(key.value).toBeNull());
    expect(useUntheme().config.theme.id).toBe("bbf");
  });

  it("keeps the stored theme when the request fails", async () => {
    fetch.mockRejectedValue(new Error("offline"));
    const key = useCookie("untheme-key");
    key.value = "nord";
    await setup();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    await Promise.resolve();
    expect(key.value).toBe("nord");
    expect(useUntheme().config.theme.id).toBe("bbf");
  });
});
