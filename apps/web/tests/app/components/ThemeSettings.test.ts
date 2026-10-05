import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { useUntheme } from "#imports";
import ThemeSettings from "~/components/ThemeSettings.vue";
import SegmentedControl from "@zoobzio/foundation/components/core/segmented-control";

// The popover content is portalled to the body, so it is queried from there.
const all = (selector: string) => [
  ...document.body.querySelectorAll<HTMLElement>(selector),
];

const popover = () => document.body.querySelector('[role="dialog"]');

const groups = () => all(".theme-settings-setting .f-caption");

const segments = (setting: string) =>
  all(`[aria-labelledby="theme-settings-${setting}"] button`);

const open = async () => {
  const wrapper = mount(ThemeSettings, { attachTo: document.body });
  await wrapper.find("button").trigger("click");
  await vi.waitFor(() => expect(groups().length).toBe(8));
  return wrapper;
};

describe("ThemeSettings", () => {
  it("opens a popover from a labelled sliders button", async () => {
    const wrapper = mount(ThemeSettings, { attachTo: document.body });
    const trigger = wrapper.find("button");
    expect(trigger.attributes("aria-label")).toBe("Appearance settings");
    expect(trigger.attributes("aria-haspopup")).toBe("dialog");
    expect(trigger.find("use").attributes("href")).toBe("#sliders");
    expect(popover()).toBeNull();

    await trigger.trigger("click");
    await vi.waitFor(() => expect(popover()).not.toBeNull());
    const group = popover()!.querySelector('[role="group"].theme-settings')!;
    expect(group.getAttribute("aria-label")).toBe("Appearance settings");
    expect(popover()!.classList).toContain("f-popover-content");
  });

  it("is not a modal, and offers no themes", async () => {
    await open();
    expect(document.body.querySelector(".f-dialog-overlay")).toBeNull();
    expect(all('[role="option"]')).toEqual([]);
  });

  it("closes from its button", async () => {
    const wrapper = await open();
    await wrapper.find("button").trigger("click");
    await vi.waitFor(() => expect(popover()).toBeNull());
  });

  it("offers every modifier but the theme as a button group", async () => {
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

  it("applies the context pressed and stays open", async () => {
    await open();
    segments("density")
      .find((item) => item.textContent!.trim() === "Spacious")!
      .click();
    await vi.waitFor(() =>
      expect(useUntheme().config.input.density).toBe("spacious"),
    );
    expect(popover()).not.toBeNull();
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
