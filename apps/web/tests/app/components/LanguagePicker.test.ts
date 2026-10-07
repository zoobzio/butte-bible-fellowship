import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setRoutePath, useNuxtApp } from "#imports";
import LanguagePicker from "~/components/LanguagePicker.vue";
import Menu from "@zoobzio/foundation/components/core/menu";

const links = (wrapper: ReturnType<typeof mount>) =>
  (
    wrapper.findComponent(Menu).props("groups") as {
      items: { label: string; link: { to: string } }[];
    }[]
  )[0]!.items.map(({ label, link }) => [label, link.to]);

describe("LanguagePicker", () => {
  it("opens from a labelled button naming the language being read", () => {
    const trigger = mount(LanguagePicker).find("button");
    expect(trigger.attributes("aria-label")).toBe(
      useNuxtApp().$t.language.open(),
    );
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.find("use").attributes("href")).toBe("#languages");
    expect(trigger.text()).toBe("English");
  });

  it("names the route's language on a translated page", () => {
    setRoutePath("/es/about-us");
    expect(mount(LanguagePicker).find("button").text()).toBe("Español");
  });

  it("links every language, by its own name, to the page being read", () => {
    setRoutePath("/about-us");
    expect(links(mount(LanguagePicker))).toEqual([
      ["English", "/about-us"],
      ["Español", "/es/about-us"],
      ["Français", "/fr/about-us"],
    ]);
  });

  it("links back to the English page, and to each home page, without doubling the locale", () => {
    setRoutePath("/fr");
    expect(links(mount(LanguagePicker))).toEqual([
      ["English", "/"],
      ["Español", "/es"],
      ["Français", "/fr"],
    ]);
  });
});
