import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import { useOrbDrift } from "~/composables/orbs";
import { orbDrift } from "~/utils/orbs";
import { withSetup } from "#test/support/mount";
import { stubMatchMedia, stubPage } from "#test/support/page";

const setup = () => {
  const left = document.createElement("span");
  const right = document.createElement("span");
  const mounted = withSetup(() =>
    useOrbDrift({ left: ref(left), right: ref(right) }),
  );
  return { ...mounted, left, right };
};

/** The transforms both orbs should carry at `progress`. */
const drifted = (progress: number) => ({
  left: `translate3d(0, ${orbDrift(progress)}px, 0)`,
  right: `translate3d(0, -${orbDrift(progress)}px, 0)`,
});

const transforms = (orbs: { left: HTMLElement; right: HTMLElement }) => ({
  left: orbs.left.style.transform,
  right: orbs.right.style.transform,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useOrbDrift", () => {
  it("places the orbs for the current scroll position on mount", () => {
    stubMatchMedia(false);
    stubPage({ scrollY: 1600 });
    expect(transforms(setup())).toEqual(drifted(0.5));
  });

  it("moves the orbs in opposite directions as the page scrolls", async () => {
    stubMatchMedia(false);
    const { frame, scroll } = stubPage();
    const orbs = setup();

    scroll(3200);
    await frame();
    expect(transforms(orbs)).toEqual(drifted(1));
    expect(orbs.left.style.transform).not.toBe(orbs.right.style.transform);
  });

  it("holds the orbs still against scroll under reduced motion", async () => {
    stubMatchMedia(true);
    const { frame, scroll } = stubPage();
    const orbs = setup();

    scroll(3200);
    await frame();
    expect(transforms(orbs)).toEqual(drifted(0));
  });

  it("repaints against the current page when scheduled", async () => {
    stubMatchMedia(false);
    const { frame, page } = stubPage({ scrollY: 800 });
    const orbs = setup();
    expect(transforms(orbs)).toEqual(drifted(0.25));

    page.scrollHeight = 2400;
    orbs.result.schedule();
    expect(transforms(orbs)).toEqual(drifted(0.25));

    await frame();
    expect(transforms(orbs)).toEqual(drifted(0.5));
  });

  it("still repaints when scheduled under reduced motion", async () => {
    stubMatchMedia(true);
    const { frame, page } = stubPage();
    const orbs = setup();

    page.scrollY = 1600;
    orbs.result.schedule();
    await frame();
    expect(transforms(orbs)).toEqual(drifted(0.5));
  });

  it("skips an orb that is not in the DOM", () => {
    stubMatchMedia(false);
    stubPage({ scrollY: 1600 });
    const left = document.createElement("span");
    const right = document.createElement("span");

    withSetup(() => useOrbDrift({ left: ref(null), right: ref(right) }));
    expect(right.style.transform).toBe(drifted(0.5).right);

    withSetup(() => useOrbDrift({ left: ref(left), right: ref(null) }));
    expect(left.style.transform).toBe(drifted(0.5).left);
  });
});
