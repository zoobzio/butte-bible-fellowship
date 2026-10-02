import { vi } from "vitest";
import { nextTick } from "vue";

export interface PageMetrics {
  scrollY: number;
  scrollHeight: number;
  innerHeight: number;
  innerWidth: number;
}

/**
 * Puts the window's scroll metrics and animation frames under test control.
 * The defaults give a 3200px scroll range, so scrollY 1600 is half way.
 * Frames only run when `frame()` is called. Undo with `vi.unstubAllGlobals()`.
 */
export const stubPage = (metrics: Partial<PageMetrics> = {}) => {
  const page: PageMetrics = {
    scrollY: 0,
    scrollHeight: 4000,
    innerHeight: 800,
    innerWidth: 1280,
    ...metrics,
  };

  for (const key of ["scrollY", "innerHeight", "innerWidth"] as const) {
    Object.defineProperty(window, key, {
      configurable: true,
      get: () => page[key],
    });
  }
  for (const el of [document.documentElement, document.body]) {
    Object.defineProperty(el, "scrollHeight", {
      configurable: true,
      get: () => page.scrollHeight,
    });
  }

  const frames = new Map<number, FrameRequestCallback>();
  let handle = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++handle, callback);
    return handle;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frames.delete(id);
  });

  return {
    page,
    /** Runs the frames requested so far, then lets watchers flush. */
    frame: async (time = 0) => {
      const due = [...frames.values()];
      frames.clear();
      for (const callback of due) callback(time);
      await nextTick();
    },
    /** How many frames are waiting to run. */
    pending: () => frames.size,
    scroll: (scrollY: number) => {
      page.scrollY = scrollY;
      window.dispatchEvent(new Event("scroll"));
    },
    resize: (next: Partial<PageMetrics> = {}) => {
      Object.assign(page, next);
      window.dispatchEvent(new Event("resize"));
    },
  };
};

/** Answers every media query with `matches`. */
export const stubMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn(() => ({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
};
