import { describe, expect, it } from "vitest";

import { setRoutePath } from "#imports";
import { useRouteLocale } from "~/composables/locale";

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
