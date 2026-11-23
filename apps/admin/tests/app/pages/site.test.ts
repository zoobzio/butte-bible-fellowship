import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { NuxtPage } from "#components";
import { setRoutePath } from "#imports";
import ContentBody from "~/components/ContentBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import SiteEditor from "~/components/SiteEditor.vue";
import SitePage from "~/components/SitePage.vue";
import SiteHeader from "~/components/SiteHeader.vue";
import AboutPage from "~/pages/site/about-us.vue";
import About from "~/pages/site/about-us/content.vue";
import ConnectPage from "~/pages/site/connect.vue";
import Connect from "~/pages/site/connect/content.vue";
import HomePage from "~/pages/site/home.vue";
import Home from "~/pages/site/home/content.vue";
import Index from "~/pages/site/index.vue";
import { ABOUT_PAGE, CONNECT_PAGE, HOME_PAGE } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const missing = () =>
  vi.fn(async () => {
    throw Object.assign(new Error("404"), { status: 404 });
  });

describe("site page", () => {
  it("heads the site's own pages, with no way back, no tabs and nothing to add", () => {
    const wrapper = mount(Index);
    expect(wrapper.findComponent(PageHeader).props()).toMatchObject({
      title: "Site",
      description: "The site’s main pages. Select one to edit.",
      back: undefined,
      action: undefined,
      tabs: undefined,
    });
    expect(wrapper.find(".page-header-actions").exists()).toBe(false);
    expect(wrapper.find(".page-header-tabs").exists()).toBe(false);
    expect(head()).toEqual({ title: "Site" });
  });

  it("lists a card for each page, in the site's order, each the link to its page in the admin", () => {
    const wrapper = mount(Index);
    const list = wrapper.find("header.page-header + ul.site-cards");
    expect(list.attributes("aria-label")).toBe("Pages");
    expect(
      list
        .findAll("li > a.site-card")
        .map((card) => [
          card.attributes("href"),
          card.find("h2.site-card-title").text(),
        ]),
    ).toEqual([
      ["/site/home", "Home"],
      ["/site/about-us", "About Us"],
      ["/site/connect", "Connect"],
    ]);
  });

  it("says on each card what of the page is changed there", () => {
    const wrapper = mount(Index);
    expect(
      wrapper.findAll(".site-card-description").map((line) => line.text()),
    ).toEqual([
      "The hero heading, image and welcome text.",
      "The page title and description, and the church’s vision and beliefs.",
      "The church’s address, phone, fax, email and office hours.",
    ]);
  });

  it("asks nothing of the API: a card needs no record", () => {
    const fetch = vi.fn();
    vi.stubGlobal("$fetch", fetch);
    mount(Index);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("a page of the site", () => {
  const PAGES = [
    ["/site/home", HomePage, "Home"],
    ["/site/about-us", AboutPage, "About Us"],
    ["/site/connect", ConnectPage, "Connect"],
  ] as const;

  it("is headed by its own name, over the way back to the list", () => {
    for (const [path, Page, title] of PAGES) {
      setRoutePath(`${path}/content`);
      const wrapper = mount(Page);
      expect(wrapper.findComponent(PageHeader).props(), path).toMatchObject({
        title,
        back: { label: "Site", to: "/site", icon: "chevron-left" },
        action: undefined,
      });
      expect(head(), path).toEqual({ title });
    }
  });

  it("offers Content as its first tab, and its only one yet, lit while it is read", () => {
    for (const [path, Page] of PAGES) {
      setRoutePath(`${path}/content`);
      const wrapper = mount(Page);
      expect(wrapper.findComponent(PageHeader).props("tabs"), path).toEqual([
        { label: "Content", to: `${path}/content` },
      ]);
      expect(
        wrapper
          .findAll(".page-header-tabs .f-tabs-trigger")
          .map((tab) => [
            tab.element.tagName,
            tab.text(),
            tab.attributes("href"),
            tab.attributes("data-state"),
          ]),
        path,
      ).toEqual([["A", "Content", `${path}/content`, "active"]]);
    }
  });

  it("draws the tab's page under the header, asks nothing of the API itself, and hands the tab nothing", () => {
    const fetch = vi.fn();
    vi.stubGlobal("$fetch", fetch);
    for (const [path, Page] of PAGES) {
      setRoutePath(`${path}/content`);
      const wrapper = mount(Page);
      expect(wrapper.findComponent(SiteHeader).exists(), path).toBe(true);
      expect(
        wrapper.find("header.page-header + .nuxt-page").exists(),
        path,
      ).toBe(true);
      expect(wrapper.findComponent(NuxtPage).props("record")).toBeUndefined();
    }
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("home page's content tab", () => {
  it("reads the home page and edits it as a page of the content is: its metadata, its outline and what is written on it, with its hero's picture over them", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await mountSuspended(Home);
    expect(error).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {});
    const page = wrapper.findComponent(SitePage);
    expect(page.props()).toMatchObject({
      record: HOME_PAGE,
      address: "/api/site/home/body",
    });
    expect(page.props("editor").form.id).toBe("home");
    expect(wrapper.findComponent(SiteEditor).exists()).toBe(true);
    expect(wrapper.findComponent(ContentBody).props("address")).toBe(
      "/api/site/home/body",
    );
    expect(
      (wrapper.find("#home-heroHeading").element as HTMLInputElement).value,
    ).toBe("Discover God’s **Love, Grace & Truth**");
    expect(
      wrapper.find(".site-page-side > .site-editor .image-field").exists(),
    ).toBe(true);
    expect(wrapper.find(".content-body").text()).toContain(
      "Has served since 2010.",
    );
    // The page around the tab heads it: the tab draws no header of its own.
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("throws a 404 should the page's row be missing", async () => {
    vi.stubGlobal("$fetch", missing());
    const { wrapper, error } = await mountSuspended(Home);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.findComponent(SitePage).exists()).toBe(false);
  });
});

describe("About Us's content tab", () => {
  it("reads About Us and edits it the same way: a title, a description and what is written, and no picture", async () => {
    const fetch = vi.fn(async () => ABOUT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await mountSuspended(About);
    expect(error).toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("/api/site/about", {});
    const page = wrapper.findComponent(SitePage);
    expect(page.props()).toMatchObject({
      record: ABOUT_PAGE,
      address: "/api/site/about/body",
    });
    expect(page.props("editor").form.id).toBe("about");
    expect(
      (wrapper.find("#about-title").element as HTMLInputElement).value,
    ).toBe("About Us");
    expect(wrapper.find("#about-heroHeading").exists()).toBe(false);
    expect(wrapper.find(".image-field").exists()).toBe(false);
  });

  it("throws a 404 should the page's row be missing", async () => {
    vi.stubGlobal("$fetch", missing());
    const { wrapper, error } = await mountSuspended(About);
    expect(error).toMatchObject({ statusCode: 404 });
    expect(wrapper.findComponent(SitePage).exists()).toBe(false);
  });
});

describe("connect page's content tab", () => {
  it("reads the connect page and edits it the same way: how to reach the church in its metadata, beside what is written", async () => {
    const fetch = vi.fn(async () => CONNECT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await mountSuspended(Connect);
    expect(error).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/site/connect", {});
    const page = wrapper.findComponent(SitePage);
    expect(page.props()).toMatchObject({
      record: CONNECT_PAGE,
      address: "/api/site/connect/body",
    });
    expect(page.props("editor").form.id).toBe("connect");
    expect(
      (wrapper.find("#connect-address").element as HTMLInputElement).value,
    ).toBe("2255 Pillsbury Road, Chico, California 95926");
    expect(
      (wrapper.find("#connect-hours").element as HTMLTextAreaElement).value,
    ).toBe("Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon");
    expect(wrapper.findComponent(ContentBody).props("address")).toBe(
      "/api/site/connect/body",
    );
    expect(wrapper.find(".image-field").exists()).toBe(false);
  });

  it("throws a 404 should the page's row be missing", async () => {
    vi.stubGlobal("$fetch", missing());
    const { wrapper, error } = await mountSuspended(Connect);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.findComponent(SitePage).exists()).toBe(false);
  });
});
