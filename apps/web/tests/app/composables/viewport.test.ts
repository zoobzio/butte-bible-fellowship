import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { useMediaQuery } from "~/composables/viewport";

/** A controllable MediaQueryList stand-in. */
const stubMatchMedia = (initial: boolean) => {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql = {
    matches: initial,
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) =>
      listeners.add(fn),
    removeEventListener: (_: string, fn: (e: { matches: boolean }) => void) =>
      listeners.delete(fn),
  };
  const emit = (matches: boolean) => {
    mql.matches = matches;
    listeners.forEach((fn) => fn({ matches }));
  };
  window.matchMedia = vi.fn(() => mql) as unknown as typeof window.matchMedia;
  return { emit, listeners };
};

const harness = () =>
  mount(
    defineComponent({
      setup() {
        return { matches: useMediaQuery("(max-width: 44rem)") };
      },
      template: `<span>{{ matches }}</span>`,
    }),
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  it("reads the query result on mount", async () => {
    stubMatchMedia(true);
    const wrapper = harness();
    await nextTick();
    expect(wrapper.text()).toBe("true");
  });

  it("reacts when the viewport crosses the breakpoint", async () => {
    const { emit } = stubMatchMedia(false);
    const wrapper = harness();
    await nextTick();
    expect(wrapper.text()).toBe("false");

    emit(true);
    await nextTick();
    expect(wrapper.text()).toBe("true");
  });

  it("detaches its listener on unmount", async () => {
    const { listeners } = stubMatchMedia(false);
    const wrapper = harness();
    await nextTick();
    expect(listeners.size).toBe(1);

    wrapper.unmount();
    expect(listeners.size).toBe(0);
  });
});
