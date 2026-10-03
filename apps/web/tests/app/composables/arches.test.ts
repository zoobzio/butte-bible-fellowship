import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

import { useArchLines } from "~/composables/arches";
import {
  ARCH_CONFIGS,
  ARCH_INTRO_MS,
  ARCH_LAG,
  ARCH_VB_W,
} from "~/constants/arches";
import {
  archBounds,
  archReveal,
  archStop,
  describeArchLine,
} from "~/utils/arches";
import { withSetup } from "#test/support/mount";
import { stubMatchMedia, stubPage } from "#test/support/page";

const SVG_NS = "http://www.w3.org/2000/svg";

// happy-dom has no path geometry, so a path's length is its data's length.
beforeAll(() => {
  const proto = Object.getPrototypeOf(document.createElementNS(SVG_NS, "path"));
  proto.getTotalLength = function (this: SVGPathElement) {
    return (this.getAttribute("d") ?? "").length;
  };
});

/** Captures the page's ResizeObserver callbacks so tests can fire them. */
const stubResizeObserver = () => {
  const observers = new Set<() => void>();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {
        observers.add(this.callback);
      }
      disconnect() {
        observers.delete(this.callback);
      }
    },
  );
  return {
    observers,
    notify: () => observers.forEach((callback) => callback()),
  };
};

interface Geometry {
  heroTop: number;
  heroHeight: number;
  footerTop: number;
}

/** Adds a hero and footer whose document positions follow `geometry`. */
const addChrome = (geometry: Geometry, page: { scrollY: number }) => {
  const hero = document.createElement("div");
  hero.className = "home-hero";
  hero.getBoundingClientRect = () =>
    ({
      top: geometry.heroTop - page.scrollY,
      bottom: geometry.heroTop + geometry.heroHeight - page.scrollY,
      height: geometry.heroHeight,
    }) as DOMRect;
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.getBoundingClientRect = () =>
    ({ top: geometry.footerTop - page.scrollY }) as DOMRect;
  document.body.append(hero, footer);
};

const setup = ({ reduce = true, chrome = true } = {}) => {
  stubMatchMedia(reduce);
  const page = stubPage();
  const resizeObserver = stubResizeObserver();
  const geometry: Geometry = { heroTop: 80, heroHeight: 600, footerTop: 3400 };
  if (chrome) addChrome(geometry, page.page);

  const track = document.createElement("div");
  const svg = document.createElementNS(SVG_NS, "svg");
  const pathA = document.createElementNS(SVG_NS, "path");
  const pathB = document.createElementNS(SVG_NS, "path");
  const mounted = withSetup(() =>
    useArchLines({
      track: ref(track),
      svg: ref(svg),
      pathA: ref(pathA),
      pathB: ref(pathB),
    }),
  );
  return {
    ...mounted,
    ...page,
    ...resizeObserver,
    geometry,
    track,
    svg,
    pathA,
    pathB,
  };
};

/** What a line should look like for `geometry`, by the pure helpers. */
const expected = (key: "A" | "B", geometry: Geometry) => {
  const { top, bottom } = archBounds(
    {
      top: geometry.heroTop,
      bottom: geometry.heroTop + geometry.heroHeight,
      height: geometry.heroHeight,
    },
    0,
  );
  const spec = describeArchLine(
    top,
    bottom,
    geometry.footerTop,
    ARCH_CONFIGS[key],
  );
  const length = spec.d.length;
  const stop = archStop(spec.arch.length, length);
  return {
    d: spec.d,
    length,
    offset: (progress: number, intro: number) =>
      (length * (1 - archReveal(stop, progress, intro, ARCH_LAG[key]))).toFixed(
        1,
      ),
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("useArchLines", () => {
  it("sizes the track and viewBox to the top of the footer", () => {
    const { track, svg, geometry } = setup();
    expect(track.style.height).toBe(`${geometry.footerTop}px`);
    expect(svg.getAttribute("viewBox")).toBe(
      `0 0 ${ARCH_VB_W} ${geometry.footerTop}`,
    );
  });

  it("draws each line from the hero down to the footer", () => {
    const { pathA, pathB, geometry } = setup();
    for (const [key, path] of [
      ["A", pathA],
      ["B", pathB],
    ] as const) {
      const line = expected(key, geometry);
      expect(path.getAttribute("d")).toBe(line.d);
      expect(path.style.strokeDasharray).toBe(String(line.length));
    }
  });

  it("shows the arch straight away under reduced motion", () => {
    const { pathA, pathB, geometry, pending } = setup({ reduce: true });
    expect(pathA.style.strokeDashoffset).toBe(
      expected("A", geometry).offset(0, 1),
    );
    expect(pathB.style.strokeDashoffset).toBe(
      expected("B", geometry).offset(0, 1),
    );
    expect(pending()).toBe(0);
  });

  it("starts hidden and draws the arch in over the intro", async () => {
    const { pathA, geometry, frame, pending } = setup({ reduce: false });
    const line = expected("A", geometry);
    expect(pathA.style.strokeDashoffset).toBe(line.offset(0, 0));

    await frame(1000);
    await frame(1000 + ARCH_INTRO_MS / 2);
    const midway = Number(pathA.style.strokeDashoffset);
    expect(midway).toBeLessThan(Number(line.offset(0, 0)));
    expect(midway).toBeGreaterThan(Number(line.offset(0, 1)));

    await frame(1000 + ARCH_INTRO_MS);
    expect(pathA.style.strokeDashoffset).toBe(line.offset(0, 1));
    expect(pending()).toBe(0);
  });

  it("extends the lines as the page scrolls and retracts them on the way back", async () => {
    const { pathA, pathB, geometry, frame, scroll } = setup();

    scroll(1600);
    await frame();
    expect(pathA.style.strokeDashoffset).toBe(
      expected("A", geometry).offset(0.5, 1),
    );
    expect(pathB.style.strokeDashoffset).toBe(
      expected("B", geometry).offset(0.5, 1),
    );

    scroll(3200);
    await frame();
    expect(pathA.style.strokeDashoffset).toBe("0.0");
    expect(pathB.style.strokeDashoffset).toBe(
      expected("B", geometry).offset(1, 1),
    );

    scroll(0);
    await frame();
    expect(pathA.style.strokeDashoffset).toBe(
      expected("A", geometry).offset(0, 1),
    );
  });

  it("lays out again on resize and on load", () => {
    const { track, pathA, geometry, resize } = setup();

    geometry.footerTop = 5000;
    resize();
    expect(track.style.height).toBe("5000px");
    expect(pathA.getAttribute("d")).toBe(expected("A", geometry).d);

    geometry.footerTop = 5200;
    window.dispatchEvent(new Event("load"));
    expect(track.style.height).toBe("5200px");
  });

  it("lays out again when the observed geometry moves", () => {
    const { track, geometry, notify } = setup();

    geometry.footerTop = 4100;
    notify();
    expect(track.style.height).toBe("4100px");
  });

  it("ignores observer callbacks when nothing it depends on moved", () => {
    const { pathA, geometry, notify } = setup();
    notify();
    const before = pathA.getAttribute("d");

    // The hero's offset is not part of the signature, so this is not a move.
    geometry.heroTop = 300;
    notify();
    expect(pathA.getAttribute("d")).toBe(before);
  });

  it("ignores observer callbacks while there is no hero", () => {
    const { track, notify } = setup({ chrome: false });
    notify();
    expect(track.style.height).toBe("");
  });

  it("observes the hero and viewport alone when there is no footer", () => {
    const { pathA, geometry, notify } = setup();
    document.querySelector(".site-footer")!.remove();
    notify();
    const withoutFooter = pathA.getAttribute("d");
    expect(withoutFooter).not.toBe(expected("A", geometry).d);

    geometry.heroHeight = 700;
    notify();
    expect(pathA.getAttribute("d")).not.toBe(withoutFooter);
  });

  it("waits for the hero when it is not mounted yet", async () => {
    const { track, pathA, geometry, page } = setup({ chrome: false });
    expect(pathA.getAttribute("d")).toBeNull();

    addChrome(geometry, page);
    await nextTick();
    expect(track.style.height).toBe(`${geometry.footerTop}px`);
    expect(pathA.getAttribute("d")).toBe(expected("A", geometry).d);
  });

  it("runs to the end of the document when there is no footer", () => {
    stubMatchMedia(true);
    const { page } = stubPage({ scrollHeight: 2800 });
    stubResizeObserver();
    addChrome({ heroTop: 80, heroHeight: 600, footerTop: 0 }, page);
    document.querySelector(".site-footer")!.remove();

    const track = document.createElement("div");
    withSetup(() =>
      useArchLines({
        track: ref(track),
        svg: ref(document.createElementNS(SVG_NS, "svg")),
        pathA: ref(document.createElementNS(SVG_NS, "path")),
        pathB: ref(document.createElementNS(SVG_NS, "path")),
      }),
    );
    expect(track.style.height).toBe("2800px");
  });

  it("exposes relayout and a frame-throttled repaint", async () => {
    const { result, track, pathA, geometry, page, frame } = setup();

    geometry.footerTop = 4400;
    result.relayout();
    expect(track.style.height).toBe("4400px");

    page.scrollY = 3200;
    result.schedule();
    result.schedule();
    await frame();
    expect(pathA.style.strokeDashoffset).toBe("0.0");
  });

  it("stops listening, observing and animating on unmount", async () => {
    const { wrapper, track, geometry, resize, observers, pending } = setup({
      reduce: false,
    });
    expect(observers.size).toBe(1);
    expect(pending()).toBe(1);

    wrapper.unmount();
    expect(observers.size).toBe(0);
    expect(pending()).toBe(0);

    geometry.footerTop = 5000;
    resize();
    window.dispatchEvent(new Event("load"));
    expect(track.style.height).toBe("3400px");
  });
});
