import { describe, expect, it } from "vitest";

import {
  requestedDocuments,
  setContentPages,
  setLocale,
  setRoutePath,
} from "#imports";
import { useAboutPage, useHomePage, usePage } from "~/composables/page";
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

const HEADING = "Discover God’s **Love, Grace & Truth**";

const HERO = {
  heading: HEADING,
  description: "Join us.",
  action: "Learn More",
  link: "/about-us",
};

describe("useHomePage", () => {
  it("resolves the home page, whatever the route: its hero with its front matter, and its body", async () => {
    const home = document({ title: "Home", hero: HERO, image: "/no.jpg" });
    setContentPages({ "/": home });
    setRoutePath("/somewhere");
    const { data } = await useHomePage();
    expect(requestedDocuments).toEqual(["en/index.json"]);
    expect(data.value).toEqual({ title: "Home", hero: HERO, body: home });
  });

  it("resolves to null when there is no home page", async () => {
    const { data } = await useHomePage();
    expect(data.value).toBeNull();
  });

  it("refuses a home page with no hero", async () => {
    setContentPages({ "/": document({ title: "Home" }) });
    await expect(useHomePage()).rejects.toThrow();
  });
});

describe("useAboutPage", () => {
  it("resolves About Us, whatever the route: the title and description it opens with, and its body", async () => {
    const about = document({
      title: "About Us",
      description: "A clean canvas.",
    });
    setContentPages({ "/about-us": about });
    setRoutePath("/");
    const { data } = await useAboutPage();
    expect(requestedDocuments).toEqual(["en/about-us.json"]);
    expect(data.value).toEqual({
      title: "About Us",
      description: "A clean canvas.",
      body: about,
    });
  });

  it("resolves to null when there is no such page", async () => {
    const { data } = await useAboutPage();
    expect(data.value).toBeNull();
  });
});
