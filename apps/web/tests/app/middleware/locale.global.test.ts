import { describe, expect, it } from "vitest";

import { useLocale, useNuxtApp } from "#imports";
import middleware from "~/middleware/locale.global";

const visit = (path: string) =>
  (middleware as (to: { path: string }) => Promise<void>)({ path });

describe("locale middleware", () => {
  it("switches to the locale the path leads with", async () => {
    await visit("/es/about-us");
    expect(useLocale().locale.value).toBe("es");
    expect(useNuxtApp().$t.navigation.home()).toBe("Inicio");
  });

  it("switches back to English on a path with no locale", async () => {
    await visit("/fr");
    expect(useLocale().locale.value).toBe("fr");
    await visit("/about-us");
    expect(useLocale().locale.value).toBe("en");
    expect(useNuxtApp().$t.navigation.home()).toBe("Home");
  });
});
