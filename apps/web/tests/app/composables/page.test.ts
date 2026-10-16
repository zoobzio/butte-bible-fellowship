import { describe, expect, it } from "vitest";

import { requestedDocuments, setContentPages, setRoutePath } from "#imports";
import { usePage } from "~/composables/page";
import { document, element } from "#test/support/content";

const ABOUT = document({ title: "About" }, element("p", {}, "Modern wisdom…"));

// The page as `usePage` hands it: its front matter over its body.
const PAGE = { title: "About", body: ABOUT };

describe("usePage", () => {
  it("resolves the page at a path: its front matter, and its body", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/about-us");
    const { data } = await usePage();
    expect(data.value).toEqual(PAGE);
  });

  it("resolves a path with no page to null", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/missing");
    const { data } = await usePage();
    expect(data.value).toBeNull();
  });

  it("resolves the page a component names, whatever the route", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/es/acerca");
    const { data } = await usePage("/about-us");
    expect(requestedDocuments).toEqual(["es/about-us.json"]);
    expect(data.value).toEqual(PAGE);
  });

  it("asks for the English page for a path with no locale", async () => {
    setRoutePath("/about-us");
    await usePage();
    expect(requestedDocuments).toEqual(["en/about-us.json"]);
  });

  it("asks for the page in the locale the path leads with", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/es/about-us");
    const { data } = await usePage();
    expect(requestedDocuments).toEqual(["es/about-us.json"]);
    expect(data.value).toEqual(PAGE);
  });

  it("asks for a locale's home page", async () => {
    setRoutePath("/fr");
    await usePage();
    expect(requestedDocuments).toEqual(["fr/index.json"]);
  });

  it("refuses a page whose front matter is not a page's", async () => {
    setContentPages({ "/about-us": document({}) });
    setRoutePath("/about-us");
    await expect(usePage()).rejects.toThrow();
  });
});
