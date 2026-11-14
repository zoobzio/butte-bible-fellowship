import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { NuxtPage } from "#components";
import { setRoutePath } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import Settings from "~/pages/settings.vue";
import Appearance from "~/pages/settings/appearance.vue";
import { head } from "#test/support/head";

describe("settings page", () => {
  it("heads the settings, with no way back and nothing to add", () => {
    setRoutePath("/settings/appearance");
    const wrapper = mount(Settings);
    expect(wrapper.findComponent(PageHeader).props()).toMatchObject({
      title: "Settings",
      description: "How the site looks.",
      back: undefined,
      action: undefined,
    });
    expect(wrapper.find(".page-header-actions").exists()).toBe(false);
    expect(head()).toEqual({ title: "Settings" });
  });

  it("offers one tab, a link to a page of its own: the site's own pages are not among the settings", () => {
    setRoutePath("/settings/appearance");
    const wrapper = mount(Settings);
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Appearance", to: "/settings/appearance" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(
      tabs.map((tab) => [
        tab.element.tagName,
        tab.text(),
        tab.attributes("href"),
      ]),
    ).toEqual([["A", "Appearance", "/settings/appearance"]]);
  });

  it("lights the tab of the page being read", () => {
    const lit = (path: string) => {
      setRoutePath(path);
      return mount(Settings)
        .findAll(".page-header-tabs .f-tabs-trigger")
        .filter((tab) => tab.attributes("data-state") === "active")
        .map((tab) => tab.text());
    };
    expect(lit("/settings/appearance")).toEqual(["Appearance"]);
    expect(lit("/settings")).toEqual([]);
  });

  it("draws the tab's page under the header, and hands it nothing", () => {
    setRoutePath("/settings/appearance");
    const wrapper = mount(Settings);
    expect(wrapper.find("header.page-header + .nuxt-page").exists()).toBe(true);
    expect(wrapper.findComponent(NuxtPage).props("record")).toBeUndefined();
  });
});

describe("appearance tab", () => {
  it("is blank: nothing is set there yet, and nothing is asked of the API", () => {
    const fetch = vi.fn();
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(Appearance);
    expect(wrapper.find(".settings-appearance").element.children).toHaveLength(
      0,
    );
    expect(wrapper.text()).toBe("");
    expect(fetch).not.toHaveBeenCalled();
  });
});
