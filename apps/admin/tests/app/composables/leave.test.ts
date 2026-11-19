import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

import { routeGuards } from "#imports";
import { useLeaveGuard } from "~/composables/leave";

/** A page that asks before it is left, dirty as a test says. */
const mountPage = (dirty = ref(false)) => {
  let guard!: ReturnType<typeof useLeaveGuard>;
  const wrapper = mount(
    defineComponent({
      setup() {
        guard = useLeaveGuard(dirty);
        return () => h("div");
      },
    }),
  );
  return { wrapper, dirty, guard };
};

/** The browser, asked whether the tab may close. */
const unload = () => {
  const event = new Event("beforeunload", { cancelable: true });
  globalThis.dispatchEvent(event);
  return event.defaultPrevented;
};

describe("useLeaveGuard", () => {
  it("asks of a move to another page, and of none between the pages under this one", () => {
    mountPage();
    expect(routeGuards().leave).toHaveLength(1);
  });

  it("lets a page with nothing to save be left, and asks nothing", () => {
    const { guard } = mountPage();
    expect(routeGuards().leave[0]!()).toBe(true);
    expect(guard.asking.value).toBe(false);
  });

  it("holds a move from a page with changes until it is answered, and stays on a no", async () => {
    const { guard } = mountPage(ref(true));
    const move = routeGuards().leave[0]!();
    expect(move).toBeInstanceOf(Promise);
    expect(guard.asking.value).toBe(true);
    guard.stay();
    expect(guard.asking.value).toBe(false);
    await expect(move).resolves.toBe(false);
  });

  it("leaves on a yes", async () => {
    const { guard } = mountPage(ref(true));
    const move = routeGuards().leave[0]!();
    guard.leave();
    expect(guard.asking.value).toBe(false);
    await expect(move).resolves.toBe(true);
  });

  it("keeps a move asked about while another waits, and drops the first", async () => {
    const { guard } = mountPage(ref(true));
    const first = routeGuards().leave[0]!();
    const second = routeGuards().leave[0]!();
    await expect(first).resolves.toBe(false);
    expect(guard.asking.value).toBe(true);
    guard.leave();
    await expect(second).resolves.toBe(true);
  });

  it("stays, should the page go while a move waits", async () => {
    const { wrapper } = mountPage(ref(true));
    const move = routeGuards().leave[0]!();
    wrapper.unmount();
    await expect(move).resolves.toBe(false);
  });

  it("has the browser ask before the tab closes on changes, and only while the page is drawn", () => {
    const { wrapper, dirty } = mountPage();
    expect(unload()).toBe(false);
    dirty.value = true;
    expect(unload()).toBe(true);
    wrapper.unmount();
    expect(unload()).toBe(false);
  });
});
