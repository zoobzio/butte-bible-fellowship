import { describe, expect, it } from "vitest";

import { queriedCollections, setContentPages, setRoutePath } from "#imports";
import { usePage } from "~/composables/page";

const ABOUT = { title: "About", path: "/about-us" };

describe("usePage", () => {
  it("resolves the page at a path", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/about-us");
    const { data } = await usePage();
    expect(data.value).toEqual(ABOUT);
  });

  it("resolves a path with no page to null", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/missing");
    const { data } = await usePage();
    expect(data.value).toBeNull();
  });

  it("asks the English collection for a path with no locale", async () => {
    setRoutePath("/about-us");
    await usePage();
    expect(queriedCollections).toEqual(["pages_en"]);
  });

  it("asks the collection of the locale the path leads with, for the same page", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/es/about-us");
    const { data } = await usePage();
    expect(queriedCollections).toEqual(["pages_es"]);
    expect(data.value).toEqual(ABOUT);
  });

  it("asks a locale's collection for its home page", async () => {
    setRoutePath("/fr");
    await usePage();
    expect(queriedCollections).toEqual(["pages_fr"]);
  });
});
