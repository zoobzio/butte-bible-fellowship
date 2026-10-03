import type { OrbDriftOptions } from "~/types/orbs";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { setRoutePath } from "#imports";
import Orbs from "~/components/Orbs.vue";
import { useOrbDrift } from "~/composables/orbs";

const schedule = vi.fn();

vi.mock("~/composables/orbs", () => ({ useOrbDrift: vi.fn() }));

beforeEach(() => {
  schedule.mockClear();
  vi.mocked(useOrbDrift).mockClear();
  vi.mocked(useOrbDrift).mockReturnValue({ schedule });
});

describe("Orbs", () => {
  it("hands its two orbs to useOrbDrift", () => {
    const wrapper = mount(Orbs);
    const { left, right } = vi.mocked(useOrbDrift).mock
      .calls[0]![0] as OrbDriftOptions;
    expect(left.value).toBe(wrapper.find(".orb-left").element);
    expect(right.value).toBe(wrapper.find(".orb-right").element);
  });

  it("marks the field as home only on the home page", async () => {
    const wrapper = mount(Orbs);
    expect(wrapper.classes()).toContain("orb-field-home");

    setRoutePath("/about-us");
    await nextTick();
    expect(wrapper.classes()).not.toContain("orb-field-home");
  });

  it("requests a repaint once a navigation has rendered", async () => {
    mount(Orbs);
    expect(schedule).not.toHaveBeenCalled();

    setRoutePath("/about-us");
    await nextTick();
    await nextTick();
    expect(schedule).toHaveBeenCalledTimes(1);
  });

  it("is hidden from assistive technology", () => {
    expect(mount(Orbs).attributes("aria-hidden")).toBe("true");
  });
});
