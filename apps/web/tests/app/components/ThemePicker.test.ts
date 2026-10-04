import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { useUntheme } from "#imports";
import ThemePicker from "~/components/ThemePicker.vue";
import Command from "@zoobzio/foundation/components/core/command";
import Dialog from "@zoobzio/foundation/components/core/dialog";
import SegmentedControl from "@zoobzio/foundation/components/core/segmented-control";

// The dialog content is portalled to the body, so it is queried from there.
const all = (selector: string) => [
  ...document.body.querySelectorAll<HTMLElement>(selector),
];

const dialog = () => document.body.querySelector('[role="dialog"]');

const themes = () => all('[role="option"]');

const names = () => themes().map((item) => item.textContent!.trim());

const groups = () => all(".theme-picker-setting .f-caption");

const segments = (setting: string) =>
  all(`[aria-labelledby="theme-picker-${setting}"] button`);

const open = async () => {
  const wrapper = mount(ThemePicker, { attachTo: document.body });
  await wrapper.find("button").trigger("click");
  await vi.waitFor(() => expect(themes().length).toBe(32));
  return wrapper;
};

describe("ThemePicker", () => {
  it("opens a dialog from a labelled palette button", async () => {
    const wrapper = mount(ThemePicker, { attachTo: document.body });
    const trigger = wrapper.find("button");
    expect(trigger.attributes("aria-label")).toBe("Choose a theme");
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(trigger.find("use").attributes("href")).toBe("#palette");
    expect(dialog()).toBeNull();

    await trigger.trigger("click");
    await vi.waitFor(() => expect(dialog()).not.toBeNull());
    expect(wrapper.findComponent(Dialog).props("title")).toBe("Appearance");
  });

  it("closes from its close button", async () => {
    await open();
    document.body
      .querySelector<HTMLElement>('button[aria-label="Close"]')!
      .click();
    await vi.waitFor(() => expect(dialog()).toBeNull());
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
    expect(dialog()).not.toBeNull();
  });

  it("keeps the active theme when it is picked again", async () => {
    await open();
    themes()
      .find((item) => item.textContent!.trim() === "Butte Bible Fellowship")!
      .click();
    await nextTick();
    expect(useUntheme().config.input.theme).toBe("bbf");
  });

  it("offers every other modifier as a button group", async () => {
    const wrapper = await open();
    expect(groups().map((group) => group.textContent!.trim())).toEqual([
      "Color scheme",
      "Vibrancy",
      "Contrast",
      "Text size",
      "Density",
      "Corner radius",
      "Depth",
      "Motion",
    ]);
    expect(wrapper.findAllComponents(SegmentedControl).length).toBe(8);
    expect(segments("density").map((item) => item.textContent!.trim())).toEqual(
      ["Compact", "Comfortable", "Spacious"],
    );
  });

  it("presses each group's selected context", async () => {
    useUntheme().swap("contrast", "high");
    await open();
    const pressed = (setting: string) =>
      segments(setting)
        .filter((item) => item.getAttribute("data-state") === "on")
        .map((item) => item.textContent!.trim());
    expect(pressed("color")).toEqual(["Light"]);
    expect(pressed("contrast")).toEqual(["High"]);
    expect(pressed("density")).toEqual(["Comfortable"]);
  });

  it("applies the context pressed", async () => {
    await open();
    segments("density")
      .find((item) => item.textContent!.trim() === "Spacious")!
      .click();
    await vi.waitFor(() =>
      expect(useUntheme().config.input.density).toBe("spacious"),
    );
  });

  it("keeps a group's selection when its pressed button is pressed again", async () => {
    await open();
    segments("color")
      .find((item) => item.textContent!.trim() === "Light")!
      .click();
    await nextTick();
    expect(useUntheme().config.input.color).toBe("light");
    expect(
      segments("color").map((item) => item.getAttribute("data-state")),
    ).toEqual(["on", "off"]);
  });
});
