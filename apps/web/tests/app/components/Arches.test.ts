import type { ArchLinesOptions } from "~/types/arches";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import Arches from "~/components/Arches.vue";
import { useArchLines } from "~/composables/arches";

vi.mock("~/composables/arches", () => ({ useArchLines: vi.fn() }));

beforeEach(() => {
  vi.mocked(useArchLines).mockClear();
});

describe("Arches", () => {
  it("hands its track, svg and both paths to useArchLines", () => {
    const wrapper = mount(Arches);
    expect(useArchLines).toHaveBeenCalledTimes(1);

    const { track, svg, pathA, pathB } = vi.mocked(useArchLines).mock
      .calls[0]![0] as ArchLinesOptions;
    expect(track.value).toBe(wrapper.element);
    expect(svg.value).toBe(wrapper.find("svg").element);
    expect(pathA.value).toBe(wrapper.find(".arch-line-a").element);
    expect(pathB.value).toBe(wrapper.find(".arch-line-b").element);
  });

  it("is hidden from assistive technology", () => {
    expect(mount(Arches).attributes("aria-hidden")).toBe("true");
  });
});
