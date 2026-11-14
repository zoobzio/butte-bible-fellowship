import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { NuxtPage } from "#components";
import { setRoutePath } from "#imports";
import ContentBody from "~/components/ContentBody.vue";
import HomeImage from "~/components/HomeImage.vue";
import PageHeader from "~/components/PageHeader.vue";
import SettingsEditor from "~/components/SettingsEditor.vue";
import SettingsPage from "~/components/SettingsPage.vue";
import Settings from "~/pages/settings.vue";
import About from "~/pages/settings/about-us.vue";
import Appearance from "~/pages/settings/appearance.vue";
import Home from "~/pages/settings/home.vue";
import { ABOUT_PAGE, HOME_PAGE } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const missing = () =>
  vi.fn(async () => {
    throw Object.assign(new Error("404"), { status: 404 });
  });

describe("settings page", () => {
  it("heads the settings, with no way back and nothing to add", () => {
    setRoutePath("/settings/home");
    const wrapper = mount(Settings);
    expect(wrapper.findComponent(PageHeader).props()).toMatchObject({
      title: "Settings",
      description:
        "The pages of the site with a layout of their own, and how the site looks.",
      back: undefined,
      action: undefined,
    });
    expect(wrapper.find(".page-header-actions").exists()).toBe(false);
    expect(head()).toEqual({ title: "Settings" });
  });

  it("offers a tab for each of what is set, each a link to a page of its own", () => {
    setRoutePath("/settings/home");
    const wrapper = mount(Settings);
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Home", to: "/settings/home" },
      { label: "About Us", to: "/settings/about-us" },
      { label: "Appearance", to: "/settings/appearance" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(
      tabs.map((tab) => [
        tab.element.tagName,
        tab.text(),
        tab.attributes("href"),
      ]),
    ).toEqual([
      ["A", "Home", "/settings/home"],
      ["A", "About Us", "/settings/about-us"],
      ["A", "Appearance", "/settings/appearance"],
    ]);
  });

  it("lights the tab of the page being read", () => {
    const lit = (path: string) => {
      setRoutePath(path);
      return mount(Settings)
        .findAll(".page-header-tabs .f-tabs-trigger")
        .filter((tab) => tab.attributes("data-state") === "active")
        .map((tab) => tab.text());
    };
    expect(lit("/settings/home")).toEqual(["Home"]);
    expect(lit("/settings/about-us")).toEqual(["About Us"]);
    expect(lit("/settings/appearance")).toEqual(["Appearance"]);
    expect(lit("/settings")).toEqual([]);
  });

  it("draws the tab's page under the header, and hands it nothing", () => {
    setRoutePath("/settings/home");
    const wrapper = mount(Settings);
    expect(wrapper.find("header.page-header + .nuxt-page").exists()).toBe(true);
    expect(wrapper.findComponent(NuxtPage).props("record")).toBeUndefined();
  });
});

describe("home tab", () => {
  it("reads the home page and edits it as a page of the content is: its metadata, its outline and what is written on it, with its hero's picture over them", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await mountSuspended(Home);
    expect(error).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/settings/home", {});
    const page = wrapper.findComponent(SettingsPage);
    expect(page.props()).toMatchObject({
      record: HOME_PAGE,
      address: "/api/settings/home/body",
    });
    expect(page.props("editor").form.id).toBe("home");
    expect(wrapper.findComponent(SettingsEditor).exists()).toBe(true);
    expect(wrapper.findComponent(ContentBody).props("address")).toBe(
      "/api/settings/home/body",
    );
    expect(
      (wrapper.find("#home-heroHeading").element as HTMLInputElement).value,
    ).toBe("Discover God’s **Love, Grace & Truth**");
    expect(
      wrapper
        .find(".settings-page-side > .home-image + .settings-editor")
        .exists(),
    ).toBe(true);
    expect(wrapper.findComponent(HomeImage).props("record")).toEqual(HOME_PAGE);
    expect(wrapper.find(".content-body").text()).toContain(
      "Has served since 2010.",
    );
    // The settings' header is the page's: the tab draws none of its own.
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("throws a 404 should the page's row be missing", async () => {
    vi.stubGlobal("$fetch", missing());
    const { wrapper, error } = await mountSuspended(Home);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.findComponent(SettingsPage).exists()).toBe(false);
  });
});

describe("about us tab", () => {
  it("reads About Us and edits it the same way: a title, a description and what is written, and no picture", async () => {
    const fetch = vi.fn(async () => ABOUT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await mountSuspended(About);
    expect(error).toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("/api/settings/about", {});
    const page = wrapper.findComponent(SettingsPage);
    expect(page.props()).toMatchObject({
      record: ABOUT_PAGE,
      address: "/api/settings/about/body",
    });
    expect(page.props("editor").form.id).toBe("about");
    expect(
      (wrapper.find("#about-title").element as HTMLInputElement).value,
    ).toBe("About Us");
    expect(wrapper.find("#about-heroHeading").exists()).toBe(false);
    expect(wrapper.findComponent(HomeImage).exists()).toBe(false);
  });

  it("throws a 404 should the page's row be missing", async () => {
    vi.stubGlobal("$fetch", missing());
    const { wrapper, error } = await mountSuspended(About);
    expect(error).toMatchObject({ statusCode: 404 });
    expect(wrapper.findComponent(SettingsPage).exists()).toBe(false);
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
