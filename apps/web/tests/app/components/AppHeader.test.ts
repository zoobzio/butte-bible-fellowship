import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { NavigationLink } from "~/types/navigation";

import { setAppConfig, useNuxtApp } from "#imports";
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
