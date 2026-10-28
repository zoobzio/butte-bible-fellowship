import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { Menu } from "#components";
import { setLocale, useLocale, useNuxtApp } from "#imports";
import LanguagePicker from "~/components/LanguagePicker.vue";

type Item = { label: string; locale: string };

const menu = (wrapper: ReturnType<typeof mount>) => wrapper.findComponent(Menu);

const items = (wrapper: ReturnType<typeof mount>) =>
  (menu(wrapper).props("groups") as { items: Item[] }[])[0]!.items;

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

  it("names the language being read, in that language", () => {
    setLocale("es");
    expect(mount(LanguagePicker).find("button").text()).toBe("Español");
  });

  it("offers every language by its own name, and none as a link", () => {
    expect(items(mount(LanguagePicker))).toEqual([
      { label: "English", locale: "en" },
      { label: "Español", locale: "es" },
      { label: "Français", locale: "fr" },
    ]);
  });

  it("switches the site to the language chosen", async () => {
    const wrapper = mount(LanguagePicker);
    const [, spanish] = items(wrapper);
    menu(wrapper).vm.$emit("select", spanish);
    await wrapper.vm.$nextTick();
    expect(useLocale().locale.value).toBe("es");
    expect(wrapper.find("button").text()).toBe("Español");
  });
});
