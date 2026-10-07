import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { NavigationLink } from "~/types/navigation";

import { setAppConfig, setRoutePath, useNuxtApp } from "#imports";
import AppHeader from "~/components/AppHeader.vue";

const LINKS: NavigationLink[] = [
  { label: "navigation.about", to: "/" },
  { label: "navigation.events", to: "/visit" },
  { label: "navigation.connect", to: "/contact" },
];

const { $t } = useNuxtApp();

const mountHeader = () =>
  mount(AppHeader, { global: { stubs: { AppMobileNav: true } } });

beforeEach(() => {
  setAppConfig({ header: { links: LINKS } });
});

describe("AppHeader", () => {
  it("links the brand to the home page with the site name and tagline", () => {
    const brand = mountHeader().find("a.site-brand");
    expect(brand.attributes("href")).toBe("/");
    expect(brand.find(".site-brand-name").text()).toBe($t.site.name());
    expect(brand.find(".site-brand-tag").text()).toBe($t.site.tagline());
  });

  it("leads the brand with the logo icon, hidden from assistive tech", () => {
    const brand = mountHeader().find("a.site-brand");
    const logo = brand.find(".site-brand-logo");
    expect(logo.attributes("aria-hidden")).toBe("true");
    expect(logo.find("use").attributes("href")).toBe("#logo");
    expect(brand.element.firstElementChild).toBe(logo.element);
  });

  it("renders the configured links in order in the primary navigation", () => {
    const nav = mountHeader().find(
      `nav[aria-label="${$t.navigation.label()}"]`,
    );
    expect(
      nav.findAll("a.site-nav-link").map((link) => ({
        label: link.text(),
        to: link.attributes("href"),
      })),
    ).toEqual(LINKS.map(({ label, to }) => ({ label: $t(label), to })));
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

  it("keeps a tab marked on the pages under its own, in any locale", () => {
    setRoutePath("/es/visit/sunday");
    const links = mountHeader().findAll("a.site-nav-link");
    expect(links.map((link) => link.attributes("data-active"))).toEqual([
      undefined,
      "",
      undefined,
    ]);
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

  it("includes the mobile navigation", () => {
    expect(mountHeader().findComponent({ name: "AppMobileNav" }).exists()).toBe(
      true,
    );
  });
});
