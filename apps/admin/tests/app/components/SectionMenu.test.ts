import type { Section } from "~/types/settings";

import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import SectionMenu from "~/components/SectionMenu.vue";

const SECTIONS: Section[] = [
  {
    label: "Color palette",
    to: "/settings/appearance/palette",
    current: true,
    unsaved: false,
    invalid: false,
  },
  {
    label: "Modifiers",
    to: "/settings/appearance/modifiers",
    current: false,
    unsaved: false,
    invalid: false,
  },
];

const mountMenu = (sections: Section[] = SECTIONS) =>
  mount(SectionMenu, { props: { label: "Appearance settings", sections } });

describe("SectionMenu", () => {
  it("is a named menu of links, one to a section, the one being read marked", () => {
    const wrapper = mountMenu();
    expect(wrapper.find("nav").attributes("aria-label")).toBe(
      "Appearance settings",
    );
    expect(
      wrapper
        .findAll("li > a.section-menu-link")
        .map((link) => [
          link.text(),
          link.attributes("href"),
          link.attributes("aria-current"),
        ]),
    ).toEqual([
      ["Color palette", "/settings/appearance/palette", "page"],
      ["Modifiers", "/settings/appearance/modifiers", undefined],
    ]);
  });

  it("marks no section without changes", () => {
    expect(mountMenu().find(".section-menu-status").exists()).toBe(false);
  });

  it("marks a section with changes not saved, in words for a reader", () => {
    const wrapper = mountMenu([
      { ...SECTIONS[0]!, unsaved: true },
      SECTIONS[1]!,
    ]);
    const links = wrapper.findAll("a.section-menu-link");
    expect(links[0]!.find(".section-menu-status").attributes()).toMatchObject({
      role: "img",
      "data-status": "unsaved",
      title: "Unsaved changes",
      "aria-label": "Unsaved changes",
    });
    expect(links[1]!.find(".section-menu-status").exists()).toBe(false);
  });

  it("marks a section a save found something wrong in, over its changes", () => {
    const wrapper = mountMenu([
      SECTIONS[0]!,
      { ...SECTIONS[1]!, unsaved: true, invalid: true },
    ]);
    const marks = wrapper.findAll(".section-menu-status");
    expect(marks).toHaveLength(1);
    expect(marks[0]!.attributes()).toMatchObject({
      role: "img",
      "data-status": "invalid",
      title: "Has errors",
      "aria-label": "Has errors",
    });
  });
});
