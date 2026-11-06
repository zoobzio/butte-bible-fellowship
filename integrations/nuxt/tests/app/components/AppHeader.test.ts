import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import type { NavigationLink } from "#layers/bbf/app/types/navigation";

import { setAppConfig, setLocale, setRoutePath, useNuxtApp } from "#imports";
import AppHeader from "#layers/bbf/app/components/AppHeader.vue";

const LINKS: NavigationLink[] = [
  { label: "navigation.about", to: "/" },
  { label: "navigation.events", to: "/visit" },
  { label: "navigation.connect", to: "/contact" },
];

const { $t } = useNuxtApp();

const mountHeader = (slot?: string) =>
  mount(AppHeader, {
    attachTo: document.body,
    slots: slot ? { default: slot } : {},
    global: { stubs: { AppMobileNav: true } },
  });

const labels = (wrapper: ReturnType<typeof mountHeader>) =>
  wrapper
    .find(".site-controls")
    .findAll("button")
    .map((button) => button.attributes("aria-label"));

beforeEach(() => {
  setAppConfig({ header: { tagline: "site.tagline", links: LINKS } });
});

describe("AppHeader", () => {
  it("links the brand to the home page with the site name and the configured tagline", () => {
    const brand = mountHeader().find("a.site-brand");
    expect(brand.attributes("href")).toBe("/");
    expect(brand.find(".site-brand-name").text()).toBe($t.site.name());
    expect(brand.find(".site-brand-tag").text()).toBe($t.site.tagline());
  });

  it("takes the tagline from the app's config", () => {
    setAppConfig({ header: { tagline: "admin.site.tag", links: [] } });
    expect(mountHeader().find(".site-brand-tag").text()).toBe("Admin");
  });

  it("leads the brand with the logo icon, hidden from assistive tech", () => {
    const brand = mountHeader().find("a.site-brand");
    const logo = brand.find(".site-brand-logo");
    expect(logo.attributes("aria-hidden")).toBe("true");
    expect(logo.find("use").attributes("href")).toBe("#logo");
    expect(brand.element.firstElementChild).toBe(logo.element);
  });

  it("renders the configured links in order in the primary navigation, after the brand", () => {
    const wrapper = mountHeader();
    const nav = wrapper.find(`nav[aria-label="${$t.navigation.label()}"]`);
    expect(
      nav.findAll("a.site-nav-link").map((link) => ({
        label: link.text(),
        to: link.attributes("href"),
      })),
    ).toEqual(LINKS.map(({ label, to }) => ({ label: $t(label), to })));
    expect(wrapper.find(".site-brand + nav.site-nav").exists()).toBe(true);
  });

  it("marks the tab of the page being read, and no other", () => {
    setRoutePath("/visit");
    const links = mountHeader().findAll("a.site-nav-link");
    expect(links.map((link) => link.attributes("data-active"))).toEqual([
      undefined,
      "",
      undefined,
    ]);
  });

  it("keeps a tab marked on the pages under its own", () => {
    setRoutePath("/visit/sunday");
    const links = mountHeader().findAll("a.site-nav-link");
    expect(links.map((link) => link.attributes("data-active"))).toEqual([
      undefined,
      "",
      undefined,
    ]);
  });

  it("ends with the language and appearance controls, as one labelled group", () => {
    const wrapper = mountHeader();
    const controls = wrapper.find('[role="group"].site-controls');
    expect(controls.attributes("aria-label")).toBe($t.appearance.label());
    expect(labels(wrapper)).toEqual([
      "Switch to dark mode",
      "Choose a theme",
      "Appearance settings",
      "Change language",
    ]);
    expect(wrapper.find("nav.site-nav + .site-actions").exists()).toBe(true);
  });

  it("puts what the app adds after the controls, before the mobile navigation", () => {
    const wrapper = mountHeader('<button class="extra">Me</button>');
    expect(
      wrapper.find(".site-controls + .extra + app-mobile-nav-stub").exists(),
    ).toBe(true);
  });

  it("keeps the mobile navigation right after the controls when the app adds nothing", () => {
    const wrapper = mountHeader();
    expect(wrapper.find(".site-controls + app-mobile-nav-stub").exists()).toBe(
      true,
    );
  });

  it("opens the appearance settings downward, from their control", async () => {
    const wrapper = mountHeader();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    await wrapper.find('[aria-label="Appearance settings"]').trigger("click");
    await vi.waitFor(() =>
      expect(document.body.querySelector(".theme-settings")).not.toBeNull(),
    );
  });

  it("speaks the reader's language, its controls among the words", () => {
    setLocale("es");
    const wrapper = mountHeader();
    expect(wrapper.find(".site-controls").attributes("aria-label")).toBe(
      $t.appearance.label(),
    );
    expect(labels(wrapper)).toEqual([
      $t.appearance.scheme({ mode: "dark" }),
      $t.appearance.open(),
      $t.appearance.settings(),
      $t.language.open(),
    ]);
    expect(labels(wrapper)).not.toContain("Switch to dark mode");
  });

  it("publishes its height to the root while it is mounted", () => {
    const wrapper = mountHeader();
    const root = document.documentElement.style;
    expect(root.getPropertyValue("--header-height")).toBe(
      `${wrapper.find("header").element.offsetHeight}px`,
    );
    wrapper.unmount();
    expect(root.getPropertyValue("--header-height")).toBe("");
  });
});
