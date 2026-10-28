import { afterEach, describe, expect, it, vi } from "vitest";

import { useFrame } from "~/composables/motion";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { stubPage } from "#test/support/page";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFrame", () => {
  it("runs the callback once per frame however often it is scheduled", async () => {
    const { frame } = stubPage();
    const callback = vi.fn();
    const { result } = withSetup(() => useFrame(callback));

    result.schedule();
    result.schedule();
    result.schedule();
    expect(callback).not.toHaveBeenCalled();

    await frame();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("can be scheduled again once the frame has run", async () => {
    const { frame } = stubPage();
    const callback = vi.fn();
    const { result } = withSetup(() => useFrame(callback));

    result.schedule();
    await frame();
    result.schedule();
    await frame();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("cancels a pending frame on unmount", async () => {
    const { frame, pending } = stubPage();
    const callback = vi.fn();
    const { result, wrapper } = withSetup(() => useFrame(callback));

    result.schedule();
    wrapper.unmount();
    expect(pending()).toBe(0);

    await frame();
    expect(callback).not.toHaveBeenCalled();
  });
});
