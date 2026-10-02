import type {
  ArchLineKey,
  ArchLineMeta,
  ArchLinesOptions,
} from "~/types/arches";

import { onBeforeUnmount, onMounted, nextTick, watch } from "vue";

import {
  ARCH_CONFIGS,
  ARCH_INTRO_MS,
  ARCH_LAG,
  ARCH_LINE_KEYS,
  ARCH_VB_W,
} from "~/constants/arches";
import { MOTION_REDUCED_QUERY } from "~/constants/motion";
import {
  archBounds,
  archReveal,
  archSignature,
  archStop,
  describeArchLine,
} from "~/utils/arches";
import { easeOutCubic } from "~/utils/motion";
import { useFrame, useScrollProgress } from "~/composables/motion";

/**
 * Drives the scroll-drawn arch lines.
 *
 * Phase 1 — load: reveal animates 0 → archStop (the arch draws on and
 *   settles inside the hero).
 * Phase 2 — scroll down: reveal extends past archStop with scroll progress.
 * Phase 3 — scroll up: reveal is a pure function of scroll offset, so it
 *   erases back along the identical track.
 *
 * Geometry lives in ~/utils/arches and scroll progress comes from
 * ~/composables/motion; this composable owns the measuring, painting,
 * layout listeners, and teardown.
 */
export const useArchLines = ({
  track,
  svg,
  pathA,
  pathB,
}: ArchLinesOptions) => {
  const { progress, refresh } = useScrollProgress();

  const meta: Partial<Record<ArchLineKey, ArchLineMeta>> = {};
  /** The line terminates here — top of the footer, in document px. */
  let endY = 0;
  let intro = 0;
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

    const scrollY = window.scrollY;
    const { top, bottom } = archBounds(hero.getBoundingClientRect(), scrollY);

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

    for (const key of ARCH_LINE_KEYS) {
      const el = els[key];
      const spec = describeArchLine(top, bottom, endY, ARCH_CONFIGS[key]);
      const archLen = measure(el, spec.arch);
      const total = measure(el, spec.d);
      el.style.strokeDasharray = String(total);
      meta[key] = { el, len: total, stop: archStop(archLen, total) };
    }
    return true;
  };

  const paint = () => {
    for (const key of ARCH_LINE_KEYS) {
      const m = meta[key];
      if (!m) continue;
      const reveal = archReveal(m.stop, progress.value, intro, ARCH_LAG[key]);
      m.el.style.strokeDashoffset = (m.len * (1 - reveal)).toFixed(1);
    }
  };

  /** Paints against a fresh read of the page, not the last scroll's. */
  const repaint = () => {
    refresh();
    paint();
  };

  const { schedule } = useFrame(repaint);

  const relayout = () => {
    layout();
    repaint();
  };

  /**
   * Only relayout when the geometry we depend on actually moved — otherwise
   * the ResizeObserver reacts to our own track-height change.
   */
  const guardedRelayout = () => {
    const hero = document.querySelector(".home-hero");
    if (!hero) return;
    const footer = document.querySelector(".site-footer");
    const next = archSignature(
      hero.getBoundingClientRect().height,
      footer ? footer.getBoundingClientRect().top + window.scrollY : 0,
      window.innerWidth,
    );
    if (next === signature) return;
    signature = next;
    relayout();
  };

  watch(progress, paint);

  onMounted(() => {
    const reduce = window.matchMedia(MOTION_REDUCED_QUERY).matches;
    intro = reduce ? 1 : 0;

    // On client-side navigation the page content may still be mounting.
    if (!layout()) {
      nextTick(relayout);
    }
    repaint();

    if (!reduce) {
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / ARCH_INTRO_MS);
        intro = easeOutCubic(t);
        repaint();
        if (t < 1) introFrame = requestAnimationFrame(step);
      };
      introFrame = requestAnimationFrame(step);
    }

    window.addEventListener("resize", relayout);
    window.addEventListener("load", relayout);
    observer = new ResizeObserver(guardedRelayout);
    observer.observe(document.body);
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(introFrame);
    window.removeEventListener("resize", relayout);
    window.removeEventListener("load", relayout);
    observer?.disconnect();
    observer = null;
  });

  return { relayout, schedule };
};
