import type { Ref } from "vue";

import { onBeforeUnmount, onMounted } from "#imports";

import { scrollProgress } from "~/utils/motion";

export interface OrbDriftOptions {
  /** The orb travelling down with scroll. */
  left: Readonly<Ref<HTMLElement | null>>;
  /** The orb travelling up with scroll. */
  right: Readonly<Ref<HTMLElement | null>>;
  /** px of drift across the whole page. */
  travel: number;
}

/**
 * Drives the two drifting background orbs: an rAF-throttled scroll/resize
 * paint moving the orbs in opposite directions, skipped entirely under
 * prefers-reduced-motion, torn down on unmount. Returns `schedule` so the
 * caller can request a repaint (e.g. after navigation changes page height).
 */
export const useOrbDrift = ({ left, right, travel }: OrbDriftOptions) => {
  let queued = false;

  const paint = () => {
    queued = false;
    const progress = scrollProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
    const drift = (progress * travel).toFixed(1);
    if (left.value) {
      left.value.style.transform = `translate3d(0, ${drift}px, 0)`;
    }
    if (right.value) {
      right.value.style.transform = `translate3d(0, -${drift}px, 0)`;
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };

  onMounted(() => {
    paint();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  });

  return { schedule };
};
