import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { useUntheme } from "#imports";
import ThemePicker from "~/components/ThemePicker.vue";

// The menu content is portalled to the body, so it is queried from there.
const items = () => [
  ...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
];

const open = async () => {
  const wrapper = mount(ThemePicker, { attachTo: document.body });
  await wrapper.find("button").trigger("keydown", { key: "Enter" });
  await nextTick();
  await nextTick();
  return wrapper;
};

const listed = () => vi.waitFor(() => expect(items().length).toBe(32));

describe("ThemePicker", () => {
  it("opens from a labelled palette button", () => {
    const trigger = mount(ThemePicker).find("button");
    expect(trigger.attributes("aria-label")).toBe("Choose a theme");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.find("use").attributes("href")).toBe("#palette");
  });

  it("lists every theme by name, the site's among them", async () => {
    await open();
    await listed();
    const names = items().map((item) => item.textContent!.trim());
    expect(names).toContain("Butte Bible Fellowship");
    expect(names).toContain("Nord");
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("marks the active theme", async () => {
    await open();
    await listed();
    const current = () =>
      items()
        .filter((item) => item.querySelector('[aria-current="true"]'))
        .map((item) => item.textContent!.trim());
    expect(current()).toEqual(["Butte Bible Fellowship"]);
  });

  it("applies the theme picked", async () => {
    await open();
    await listed();
    const nord = items().find((item) => item.textContent!.trim() === "Nord")!;
    nord.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    await vi.waitFor(() =>
      expect(useUntheme().config.input.theme).toBe("nord"),
    );
  });
});
