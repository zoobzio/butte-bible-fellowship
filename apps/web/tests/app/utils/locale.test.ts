import { describe, expect, it } from "vitest";

import {
  isSitePath,
  joinLocalePath,
  languageName,
  splitLocalePath,
} from "~/utils/locale";

describe("splitLocalePath", () => {
  it("reads a path with no locale as English", () => {
    expect(splitLocalePath("/")).toEqual({ locale: "en", path: "/" });
    expect(splitLocalePath("/about-us")).toEqual({
      locale: "en",
      path: "/about-us",
    });
  });

  it("takes a leading locale off the path", () => {
    expect(splitLocalePath("/es/about-us")).toEqual({
      locale: "es",
      path: "/about-us",
    });
    expect(splitLocalePath("/fr/a/b")).toEqual({ locale: "fr", path: "/a/b" });
  });

  it("reads a locale alone as its home page", () => {
    expect(splitLocalePath("/es")).toEqual({ locale: "es", path: "/" });
    expect(splitLocalePath("/es/")).toEqual({ locale: "es", path: "/" });
  });

  it("leaves a path alone when what leads it is not a translated locale", () => {
    expect(splitLocalePath("/en/about-us")).toEqual({
      locale: "en",
      path: "/en/about-us",
    });
    expect(splitLocalePath("/essay")).toEqual({ locale: "en", path: "/essay" });
  });
});

describe("joinLocalePath", () => {
  it("leaves English paths as they are", () => {
    expect(joinLocalePath("en", "/")).toBe("/");
    expect(joinLocalePath("en", "/about-us")).toBe("/about-us");
  });

  it("leads another locale's paths with the locale", () => {
    expect(joinLocalePath("es", "/")).toBe("/es");
    expect(joinLocalePath("fr", "/about-us")).toBe("/fr/about-us");
  });

  it("undoes splitLocalePath", () => {
    for (const path of ["/", "/about-us", "/es", "/fr/calendar"]) {
      const split = splitLocalePath(path);
      expect(joinLocalePath(split.locale, split.path)).toBe(path);
    }
  });
});

describe("isSitePath", () => {
  it("accepts a path from the root and nothing else", () => {
    expect(isSitePath("/calendar")).toBe(true);
    expect(isSitePath("https://example.com")).toBe(false);
    expect(isSitePath("//example.com")).toBe(false);
    expect(isSitePath("tel:5550100")).toBe(false);
    expect(isSitePath("#top")).toBe(false);
  });
});

describe("languageName", () => {
  it("names a language in that language, capitalized", () => {
    expect(languageName("en")).toBe("English");
    expect(languageName("es")).toBe("Español");
    expect(languageName("fr")).toBe("Français");
  });
});
