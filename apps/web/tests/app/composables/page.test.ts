import { describe, expect, it } from "vitest";

import {
  requestedDocuments,
  setContentPages,
  setLocale,
  setRoutePath,
} from "#imports";
import { usePage } from "~/composables/page";
import { document, element } from "#test/support/content";

const ABOUT = document({ title: "About" }, element("p", {}, "Modern wisdom…"));

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
    setRoutePath("/acerca");
    const { data } = await usePage("/about-us");
    expect(requestedDocuments).toEqual(["en/about-us.json"]);
    expect(data.value).toEqual(PAGE);
  });

  it("asks for the page in the language being read", async () => {
    setContentPages({ "/about-us": ABOUT });
    setLocale("es");
    setRoutePath("/about-us");
    const { data } = await usePage();
    expect(requestedDocuments).toEqual(["es/about-us.json"]);
    expect(data.value).toEqual(PAGE);
  });

  it("asks for the home page as index", async () => {
    setLocale("fr");
    setRoutePath("/");
    await usePage();
    expect(requestedDocuments).toEqual(["fr/index.json"]);
  });

  it("refuses a page whose front matter is not a page's", async () => {
    setContentPages({ "/about-us": document({}) });
    setRoutePath("/about-us");
    await expect(usePage()).rejects.toThrow();
  });
});
