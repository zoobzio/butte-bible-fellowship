import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setAppConfig } from "#imports";
import AppMobileNav from "~/components/AppMobileNav.vue";
import Menu from "~/components/Menu.vue";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Visit", to: "/visit" },
];

beforeEach(() => {
  setAppConfig({ header: { links: LINKS } });
});

describe("AppMobileNav", () => {
  it("hands the configured links to the menu as one group of link items", () => {
    const menu = mount(AppMobileNav).findComponent(Menu);
    expect(menu.props("groups")).toEqual([{ key: "primary", items: LINKS }]);
    expect(menu.props("align")).toBe("end");
  });

  it("opens from a labelled icon button", () => {
    const trigger = mount(AppMobileNav).find("button");
    expect(trigger.attributes("aria-label")).toBe("Open navigation");
    expect(trigger.find("use").attributes("href")).toBe("#menu");
  });
});
