import { afterEach, describe, expect, it, vi } from "vitest";

import { useFrame, useScrollProgress } from "~/composables/motion";
import { withSetup } from "#test/support/mount";
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

describe("useScrollProgress", () => {
  it("reads the page on mount", () => {
    stubPage({ scrollY: 1600 });
    const { result } = withSetup(() => useScrollProgress());
    expect(result.progress.value).toBe(0.5);
  });

  it("follows scroll on the next frame, not synchronously", async () => {
    const { frame, scroll } = stubPage();
    const { result } = withSetup(() => useScrollProgress());

    scroll(800);
    expect(result.progress.value).toBe(0);

    await frame();
    expect(result.progress.value).toBe(0.25);
  });

  it("reads once per frame however many scroll events arrive", async () => {
    const { frame, pending, scroll } = stubPage();
    const { result } = withSetup(() => useScrollProgress());

    scroll(400);
    scroll(800);
    scroll(3200);
    expect(pending()).toBe(1);

    await frame();
    expect(result.progress.value).toBe(1);
  });

  it("follows resize", async () => {
    const { frame, resize } = stubPage({ scrollY: 800 });
    const { result } = withSetup(() => useScrollProgress());
    expect(result.progress.value).toBe(0.25);

    resize({ innerHeight: 2400 });
    await frame();
    expect(result.progress.value).toBe(0.5);
  });

  it("re-reads immediately on refresh", () => {
    const { page } = stubPage({ scrollY: 800 });
    const { result } = withSetup(() => useScrollProgress());

    page.scrollHeight = 2400;
    expect(result.progress.value).toBe(0.25);

    result.refresh();
    expect(result.progress.value).toBe(0.5);
  });

  it("stops listening on unmount", () => {
    const { pending, resize, scroll } = stubPage();
    const { wrapper } = withSetup(() => useScrollProgress());

    wrapper.unmount();
    scroll(800);
    resize();
    expect(pending()).toBe(0);
  });
});
