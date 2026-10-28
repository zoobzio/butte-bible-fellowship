import { vi } from "vitest";
import { nextTick } from "vue";

export interface PageMetrics {
  scrollY: number;
  scrollHeight: number;
  innerHeight: number;
  innerWidth: number;
}

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
    frame: async (time = 0) => {
      const due = [...frames.values()];
      frames.clear();
      for (const callback of due) callback(time);
      await nextTick();
    },
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

