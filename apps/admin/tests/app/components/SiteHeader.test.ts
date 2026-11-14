import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setRoutePath } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import SiteHeader from "~/components/SiteHeader.vue";
import { SITE_PAGES } from "~/constants/site";
import { head } from "#test/support/head";

const mountHeader = (page: keyof typeof SITE_PAGES, path: string) => {
  setRoutePath(path);
  return mount(SiteHeader, { props: { page: SITE_PAGES[page] } });
};

describe("SiteHeader", () => {
  it("heads the page with its name and what of it is changed here", () => {
    const wrapper = mountHeader("home", "/site/home/content");
    expect(wrapper.findComponent(PageHeader).props()).toMatchObject({
      title: "Home",
      description:
        "The hero the site opens with, its picture, and the welcome written under it.",
      action: undefined,
    });
    expect(wrapper.find(".page-header-actions").exists()).toBe(false);
    expect(head()).toEqual({ title: "Home" });
  });

  it("leads back to the list of the site's pages", () => {
    const wrapper = mountHeader("connect", "/site/connect/content");
    const back = wrapper.find("a.page-header-back");
    expect(back.text()).toBe("Site");
    expect(back.attributes("href")).toBe("/site");
  });

  it("offers Content as the first tab, and the only one yet, under the page's own address", () => {
    const wrapper = mountHeader("about", "/site/about-us/content");
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Content", to: "/site/about-us/content" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(tabs.map((tab) => [tab.text(), tab.attributes("href")])).toEqual([
      ["Content", "/site/about-us/content"],
    ]);
  });

  it("lights the tab while it is read, and none at the page's bare address", () => {
    const lit = (path: string) =>
      mountHeader("home", path)
        .findAll(".page-header-tabs .f-tabs-trigger")
        .filter((tab) => tab.attributes("data-state") === "active")
        .map((tab) => tab.text());
    expect(lit("/site/home/content")).toEqual(["Content"]);
    expect(lit("/site/home")).toEqual([]);
  });
});
