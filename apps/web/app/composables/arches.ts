import type { Ref } from "vue";
import type { ArchLineConfig } from "~/utils/arches";

import { onBeforeUnmount, onMounted, nextTick } from "#imports";

import { ARCH_VB_W, describeArchLine } from "~/utils/arches";
import { easeOutCubic, scrollProgress } from "~/utils/motion";

/** Load-in draw duration. */
const INTRO_MS = 1700;

/**
 * Vertical shift of the whole track, as a fraction of the hero height.
 * The geometry is untouched — the same arch simply translates down so its
 * crown settles toward the bottom of the hero instead of the top.
 */
const Y_SHIFT = 0.6;

type LineKey = "A" | "B";

/** Per-line geometry, in ARCH_VB_W units. */
const CONFIGS: Record<LineKey, ArchLineConfig> = {
  A: { legX: 690, crownX: 880, span: 330, drift: 300 },
  B: { legX: 780, crownX: 930, span: 210, drift: 430 },
};

interface LineMeta {
  el: SVGPathElement;
  len: number;
  stop: number;
}

export interface ArchLinesOptions {
  track: Readonly<Ref<HTMLDivElement | null>>;
  svg: Readonly<Ref<SVGSVGElement | null>>;
  pathA: Readonly<Ref<SVGPathElement | null>>;
  pathB: Readonly<Ref<SVGPathElement | null>>;
}

/**
 * Drives the scroll-drawn arch lines.
 *
 * Phase 1 — load: reveal animates 0 → archStop (the arch draws on and
 *   settles inside the hero).
 * Phase 2 — scroll down: reveal extends past archStop with scroll progress.
 * Phase 3 — scroll up: reveal is a pure function of scroll offset, so it
 *   erases back along the identical track.
 *
 * Geometry lives in ~/utils/arches; this composable owns the measuring,
 * painting, listeners, and teardown.
 */
export const useArchLines = ({ track, svg, pathA, pathB }: ArchLinesOptions) => {
  const meta: Partial<Record<LineKey, LineMeta>> = {};
  /** The line terminates here — top of the footer, in document px. */
  let endY = 0;
  let intro = 0;
  let queued = false;
  let signature = "";
  let introFrame = 0;
  let observer: ResizeObserver | null = null;

  const measure = (el: SVGPathElement, d: string) => {
    el.setAttribute("d", d);
    return el.getTotalLength();
  };

  const layout = (): boolean => {
    const hero = document.querySelector(".home-hero");
    const trackEl = track.value;
    const svgEl = svg.value;
    const a = pathA.value;
    const b = pathB.value;
    if (!hero || !trackEl || !svgEl || !a || !b) return false;
    const els = { A: a, B: b };

    // Collapse first: the track sits in body's scroll height, so measuring
    // while it is tall would grow the page on every pass.
    trackEl.style.height = "0px";

    const rect = hero.getBoundingClientRect();
    const scrollY = window.scrollY;
    const shift = rect.height * Y_SHIFT;
    const top = rect.top + scrollY + shift;
    let bottom = rect.bottom + scrollY + shift;

    const footer = document.querySelector(".site-footer");
    endY = footer
      ? footer.getBoundingClientRect().top + scrollY
      : Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        );

    // The track stops at the footer, so it never adds page height.
    trackEl.style.height = `${endY}px`;
    svgEl.setAttribute("viewBox", `0 0 ${ARCH_VB_W} ${endY}`);

    // Overshoot the hero edge, as the original static arches did, so the
    // load-in draw reads as covering the whole hero.
    bottom += (bottom - top) * 0.14;

    for (const key of ["A", "B"] as const) {
      const el = els[key];
      const spec = describeArchLine(top, bottom, endY, CONFIGS[key]);
      const archLen = measure(el, spec.arch);
      const total = measure(el, spec.d);
      el.style.strokeDasharray = String(total);
      meta[key] = { el, len: total, stop: Math.min(0.95, archLen / total) };
    }
    return true;
  };

  const paint = () => {
    queued = false;
    const progress = scrollProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
    (["A", "B"] as const).forEach((key, i) => {
      const m = meta[key];
      if (!m) return;
      let reveal = (m.stop + (1 - m.stop) * progress) * intro;
      if (i === 1) reveal = Math.max(0, reveal - 0.04 * intro * progress);
      m.el.style.strokeDashoffset = (m.len * (1 - reveal)).toFixed(1);
    });
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };

  const relayout = () => {
    layout();
    paint();
  };

  /**
   * Only relayout when the geometry we depend on actually moved — otherwise
   * the ResizeObserver reacts to our own track-height change.
   */
  const guardedRelayout = () => {
    const hero = document.querySelector(".home-hero");
    if (!hero) return;
    const footer = document.querySelector(".site-footer");
    const next =
      `${Math.round(hero.getBoundingClientRect().height)}/` +
      `${footer ? Math.round(footer.getBoundingClientRect().top + window.scrollY) : 0}/` +
      `${window.innerWidth}`;
    if (next === signature) return;
    signature = next;
    relayout();
  };

  onMounted(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    intro = reduce ? 1 : 0;

    // On client-side navigation the page content may still be mounting.
    if (!layout()) {
      nextTick(relayout);
    }
    paint();

    if (!reduce) {
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / INTRO_MS);
        intro = easeOutCubic(t);
        paint();
        if (t < 1) introFrame = requestAnimationFrame(step);
      };
      introFrame = requestAnimationFrame(step);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", relayout);
    window.addEventListener("load", relayout);
    observer = new ResizeObserver(guardedRelayout);
    observer.observe(document.body);
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(introFrame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", relayout);
    window.removeEventListener("load", relayout);
    observer?.disconnect();
    observer = null;
  });

  return { relayout, schedule };
};
