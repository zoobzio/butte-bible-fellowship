import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { setAppConfig } from "#imports";
import AppMobileNav from "~/components/AppMobileNav.vue";
import Menu from "@zoobzio/foundation/components/core/menu";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Visit", to: "/visit" },
];

beforeEach(() => {
  setAppConfig({ header: { links: LINKS } });
});

// The menu content is portalled to the body, so it is queried from there.
const items = () => [
  ...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
];

const openNav = async () => {
  const wrapper = mount(AppMobileNav, { attachTo: document.body });
  await wrapper.find("button").trigger("keydown", { key: "Enter" });
  await nextTick();
  await nextTick();
  return wrapper;
};

describe("AppMobileNav", () => {
  it("hands the configured links to the menu as one group of link items", () => {
    const menu = mount(AppMobileNav).findComponent(Menu);
    expect(menu.props("groups")).toEqual([
      {
        key: "primary",
        items: [
          { label: "Home", link: { to: "/" } },
          { label: "Visit", link: { to: "/visit" } },
        ],
      },
    ]);
    expect(menu.props("align")).toBe("end");
  });

  it("opens from a labelled icon button", () => {
    const trigger = mount(AppMobileNav).find("button");
    expect(trigger.attributes("aria-label")).toBe("Open navigation");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.find("use").attributes("href")).toBe("#menu");
  });

  it("renders every link as a menu item anchor", async () => {
    await openNav();
    expect(
      items().map((item) => [item.tagName, item.getAttribute("href")]),
    ).toEqual([
      ["A", "/"],
      ["A", "/visit"],
    ]);
    expect(
      items().every((item) => item.classList.contains("f-dropdown-menu-item")),
    ).toBe(true);
  });

  it("closes after a link is chosen", async () => {
    const wrapper = await openNav();

    items()[1]!.click();
    await nextTick();
    await nextTick();

    expect(wrapper.findComponent(Menu).emitted("update:open")?.at(-1)).toEqual([
      false,
    ]);
  });
});
