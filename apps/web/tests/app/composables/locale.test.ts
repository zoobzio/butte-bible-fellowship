import { describe, expect, it } from "vitest";

import { setLocale, useLocale, useNuxtApp } from "#imports";
import { useLanguages } from "~/composables/locale";

describe("useLanguages", () => {
  it("names the language being read, in that language", () => {
    const { current } = useLanguages();
    expect(current.value).toBe("English");
    setLocale("es");
    expect(current.value).toBe("Español");
  });

  it("lists every language by its own name, and marks the one being read", () => {
    const { languages } = useLanguages();
    expect(languages.value).toEqual([
      { locale: "en", label: "English", active: true },
      { locale: "es", label: "Español", active: false },
      { locale: "fr", label: "Français", active: false },
    ]);
    setLocale("fr");
    expect(languages.value.map(({ active }) => active)).toEqual([
      false,
      false,
      true,
    ]);
  });

  it("switches the site to the language chosen", async () => {
    const { choose } = useLanguages();
    await choose("es");
    expect(useLocale().locale.value).toBe("es");
    expect(useNuxtApp().$t.navigation.about()).toBe("Quiénes somos");
    await choose("en");
    expect(useNuxtApp().$t.navigation.about()).toBe("About Us");
  });
});
