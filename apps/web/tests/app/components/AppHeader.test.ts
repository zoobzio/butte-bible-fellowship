import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setAppConfig } from "#imports";
import AppHeader from "~/components/AppHeader.vue";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Visit", to: "/visit" },
  { label: "Contact", to: "/contact" },
];

const mountHeader = () =>
  mount(AppHeader, { global: { stubs: { AppMobileNav: true } } });

beforeEach(() => {
  setAppConfig({
    site: { name: "Test Church", tagline: "On Test Road" },
    header: { links: LINKS },
  });
});

describe("AppHeader", () => {
  it("links the brand to the home page with the site name and tagline", () => {
    const brand = mountHeader().find("a.site-brand");
    expect(brand.attributes("href")).toBe("/");
    expect(brand.find(".site-brand-name").text()).toBe("Test Church");
    expect(brand.find(".site-brand-tag").text()).toBe("On Test Road");
  });

  it("renders the configured links in order in the primary navigation", () => {
    const nav = mountHeader().find('nav[aria-label="Primary"]');
    expect(
      nav.findAll("a.site-nav-link").map((link) => ({
        label: link.text(),
        to: link.attributes("href"),
      })),
    ).toEqual(LINKS);
  });

  it("includes the mobile navigation", () => {
    expect(mountHeader().findComponent({ name: "AppMobileNav" }).exists()).toBe(
      true,
    );
  });
});
