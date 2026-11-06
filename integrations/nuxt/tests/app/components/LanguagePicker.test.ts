import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { Command } from "#components";
import { setLocale, useLocale, useNuxtApp } from "#imports";
import LanguagePicker from "#layers/bbf/app/components/LanguagePicker.vue";

const all = (selector: string) => [
  ...document.body.querySelectorAll<HTMLElement>(selector),
];

const popover = () => document.body.querySelector('[role="dialog"]');

const languages = () => all('[role="option"]');

const names = () => languages().map((item) => item.textContent!.trim());

const selected = () =>
  languages()
    .filter((item) => item.getAttribute("aria-selected") === "true")
    .map((item) => item.textContent!.trim());

const open = async () => {
  const wrapper = mount(LanguagePicker, { attachTo: document.body });
  await wrapper.find("button").trigger("click");
  await vi.waitFor(() => expect(languages().length).toBe(3));
  return wrapper;
};

describe("LanguagePicker", () => {
  it("opens a popover from a labelled icon button, with no words of its own", async () => {
    const wrapper = mount(LanguagePicker, { attachTo: document.body });
    const trigger = wrapper.find("button");
    expect(trigger.attributes("aria-label")).toBe("Change language");
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(trigger.find("use").attributes("href")).toBe("#languages");
    expect(trigger.text()).toBe("");
    expect(popover()).toBeNull();

    await trigger.trigger("click");
    await vi.waitFor(() => expect(popover()).not.toBeNull());
    expect(
      popover()!.querySelector(".language-picker")!.getAttribute("aria-label"),
    ).toBe("Languages");
    expect(popover()!.classList).toContain("f-popover-content");
  });

  it("closes from its button", async () => {
    const wrapper = await open();
    await wrapper.find("button").trigger("click");
    await vi.waitFor(() => expect(popover()).toBeNull());
  });

  it("offers every language by its own name", async () => {
    await open();
    expect(names()).toEqual(["English", "Español", "Français"]);
  });

  it("marks the language being read", async () => {
    await open();
    expect(selected()).toEqual(["English"]);
  });

  it("narrows the list to the languages the search matches", async () => {
    const wrapper = await open();
    expect(wrapper.findComponent(Command).exists()).toBe(true);
    const filter = document.body.querySelector<HTMLInputElement>("input")!;
    expect(filter.placeholder).toBe("Search languages…");
    filter.value = "esp";
    filter.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(names()).toEqual(["Español"]));
  });

  it("switches the app to the language picked, and marks it", async () => {
    await open();
    languages()
      .find((item) => item.textContent!.trim() === "Español")!
      .click();
    await vi.waitFor(() => expect(useLocale().locale.value).toBe("es"));
    await vi.waitFor(() => expect(selected()).toEqual(["Español"]));
  });

  it("names itself in the reader's language", async () => {
    setLocale("es");
    const { $t } = useNuxtApp();
    expect($t.language.open()).not.toBe("Change language");
    const wrapper = mount(LanguagePicker, { attachTo: document.body });
    expect(wrapper.find("button").attributes("aria-label")).toBe(
      $t.language.open(),
    );
    await wrapper.find("button").trigger("click");
    await vi.waitFor(() => expect(popover()).not.toBeNull());
    expect(
      popover()!.querySelector(".language-picker")!.getAttribute("aria-label"),
    ).toBe($t.language.languages());
    expect(document.body.querySelector("input")!.placeholder).toBe(
      $t.language.search(),
    );
  });
});
