import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { useUntheme } from "#imports";
import ThemePicker from "~/components/ThemePicker.vue";
import Command from "@zoobzio/foundation/components/core/command";

// The popover content is portalled to the body, so it is queried from there.
const all = (selector: string) => [
  ...document.body.querySelectorAll<HTMLElement>(selector),
];

const popover = () => document.body.querySelector('[role="dialog"]');

const themes = () => all('[role="option"]');

const names = () => themes().map((item) => item.textContent!.trim());

const open = async () => {
  const wrapper = mount(ThemePicker, { attachTo: document.body });
  await wrapper.find("button").trigger("click");
  await vi.waitFor(() => expect(themes().length).toBe(32));
  return wrapper;
};

describe("ThemePicker", () => {
  it("opens a popover from a labelled palette button", async () => {
    const wrapper = mount(ThemePicker, { attachTo: document.body });
    const trigger = wrapper.find("button");
    expect(trigger.attributes("aria-label")).toBe("Choose a theme");
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(trigger.find("use").attributes("href")).toBe("#palette");
    expect(popover()).toBeNull();

    await trigger.trigger("click");
    await vi.waitFor(() => expect(popover()).not.toBeNull());
    expect(
      popover()!.querySelector(".theme-picker")!.getAttribute("aria-label"),
    ).toBe("Themes");
    expect(popover()!.classList).toContain("f-popover-content");
  });

  it("is not a modal, and offers the themes alone", async () => {
    await open();
    expect(document.body.querySelector(".f-dialog-overlay")).toBeNull();
    expect(all(".f-toggle-group-root")).toEqual([]);
  });

  it("closes from its button", async () => {
    const wrapper = await open();
    await wrapper.find("button").trigger("click");
    await vi.waitFor(() => expect(popover()).toBeNull());
  });

  it("lists every theme by name, the site's among them", async () => {
    await open();
    expect(names()).toContain("Butte Bible Fellowship");
    expect(names()).toContain("Nord");
    expect(names()).toEqual([...names()].sort((a, b) => a.localeCompare(b)));
  });

  it("marks the active theme", async () => {
    await open();
    const selected = () =>
      themes()
        .filter((item) => item.getAttribute("aria-selected") === "true")
        .map((item) => item.textContent!.trim());
    expect(selected()).toEqual(["Butte Bible Fellowship"]);
  });

  it("narrows the list to the themes the search matches", async () => {
    const wrapper = await open();
    expect(wrapper.findComponent(Command).exists()).toBe(true);
    const filter = document.body.querySelector<HTMLInputElement>("input")!;
    expect(filter.placeholder).toBe("Search themes…");
    filter.value = "nor";
    filter.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(names()).toEqual(["Nord"]));
  });

  it("applies the theme picked and stays open", async () => {
    await open();
    themes()
      .find((item) => item.textContent!.trim() === "Nord")!
      .click();
    await vi.waitFor(() =>
      expect(useUntheme().config.input.theme).toBe("nord"),
    );
    expect(popover()).not.toBeNull();
  });

  it("keeps the active theme when it is picked again", async () => {
    await open();
    themes()
      .find((item) => item.textContent!.trim() === "Butte Bible Fellowship")!
      .click();
    await nextTick();
    expect(useUntheme().config.input.theme).toBe("bbf");
  });
});
