import { describe, expect, it } from "vitest";

import { setRoutePath, useLocale, useNuxtApp } from "#imports";
import {
  useLanguages,
  useRouteLocale,
  useSelectedLocale,
} from "~/composables/locale";

describe("useRouteLocale", () => {
  it("reads the locale and the page's path off the route", () => {
    setRoutePath("/fr/about-us");
    const { locale, path } = useRouteLocale();
    expect(locale.value).toBe("fr");
    expect(path.value).toBe("/about-us");
  });

  it("follows the route", () => {
    const { locale, path } = useRouteLocale();
    expect([locale.value, path.value]).toEqual(["en", "/"]);
    setRoutePath("/es");
    expect([locale.value, path.value]).toEqual(["es", "/"]);
  });

  it("keeps a link to another page in the route's locale", () => {
    setRoutePath("/es/about-us");
    const { localize } = useRouteLocale();
    expect(localize("/")).toBe("/es");
    expect(localize("/calendar")).toBe("/es/calendar");
  });

  it("leaves English links and links off the site as they are", () => {
    const { localize } = useRouteLocale();
    expect(localize("/calendar")).toBe("/calendar");
    setRoutePath("/es");
    expect(localize("https://example.com")).toBe("https://example.com");
    expect(localize("tel:5550100")).toBe("tel:5550100");
  });
});

describe("useLanguages", () => {
  it("names the language being read, in that language", () => {
    expect(useLanguages().current.value).toBe("English");
    setRoutePath("/es/about-us");
    expect(useLanguages().current.value).toBe("Español");
  });

  it("links every language, by its own name, to the page being read", () => {
    setRoutePath("/about-us");
    expect(useLanguages().languages.value).toEqual([
      { label: "English", to: "/about-us" },
      { label: "Español", to: "/es/about-us" },
      { label: "Français", to: "/fr/about-us" },
    ]);
  });

  it("links back to the English page, and to each home page, without doubling the locale", () => {
    setRoutePath("/fr");
    expect(useLanguages().languages.value.map(({ to }) => to)).toEqual([
      "/",
      "/es",
      "/fr",
    ]);
  });
});

describe("useSelectedLocale", () => {
  it("switches to the locale a path leads with", async () => {
    const { locale, select } = useSelectedLocale();
    await select("/es/about-us");
    expect(locale.value).toBe("es");
    expect(useNuxtApp().$t.navigation.about()).toBe("Quiénes somos");
  });

  it("switches back to English on a path with no locale", async () => {
    const { select } = useSelectedLocale();
    await select("/fr");
    expect(useLocale().locale.value).toBe("fr");
    await select("/about-us");
    expect(useLocale().locale.value).toBe("en");
    expect(useNuxtApp().$t.navigation.about()).toBe("About Us");
  });
});
