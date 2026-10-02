import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { useCookie } from "#imports";
import ColorMode from "~/components/ColorMode.vue";

const icon = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find("use").attributes("href");

describe("ColorMode", () => {
  it("offers dark mode from light, with the moon icon", () => {
    const wrapper = mount(ColorMode);
    expect(wrapper.attributes("aria-label")).toBe("Switch to dark mode");
    expect(icon(wrapper)).toBe("#moon");
  });

  it("offers light mode from dark, with the sun icon", () => {
    useCookie("color-mode").value = "dark";
    const wrapper = mount(ColorMode);
    expect(wrapper.attributes("aria-label")).toBe("Switch to light mode");
    expect(icon(wrapper)).toBe("#sun");
  });

  it("switches mode on click and persists the choice", async () => {
    const wrapper = mount(ColorMode);

    await wrapper.trigger("click");
    expect(wrapper.attributes("aria-label")).toBe("Switch to light mode");
    expect(icon(wrapper)).toBe("#sun");
    expect(useCookie("color-mode").value).toBe("dark");

    await wrapper.trigger("click");
    expect(wrapper.attributes("aria-label")).toBe("Switch to dark mode");
    expect(useCookie("color-mode").value).toBe("light");
  });
});
