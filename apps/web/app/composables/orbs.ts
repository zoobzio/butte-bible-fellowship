import type { OrbDriftOptions } from "~/types/orbs";

import { onMounted, watch } from "vue";

import { MOTION_REDUCED_QUERY } from "~/constants/motion";
import { orbDrift } from "~/utils/orbs";
import { useFrame, useScrollProgress } from "~/composables/motion";

/**
 * Drives the two drifting background orbs: they move in opposite directions
 * with scroll progress, and hold still against scroll under
 * prefers-reduced-motion. Returns `schedule` so the caller can request a
 * repaint (e.g. after navigation changes page height).
 */
export const useOrbDrift = ({ left, right }: OrbDriftOptions) => {
  const { progress, refresh } = useScrollProgress();
  let reduce = false;

  const paint = () => {
    const drift = orbDrift(progress.value);
    if (left.value) {
      left.value.style.transform = `translate3d(0, ${drift}px, 0)`;
    }
    if (right.value) {
      right.value.style.transform = `translate3d(0, -${drift}px, 0)`;
    }
  };

  /** Paints against a fresh read of the page, not the last scroll's. */
  const repaint = () => {
    refresh();
    paint();
  };

  const { schedule } = useFrame(repaint);

  watch(progress, () => {
    if (!reduce) paint();
  });

  onMounted(() => {
    reduce = window.matchMedia(MOTION_REDUCED_QUERY).matches;
    repaint();
  });

  return { schedule };
};
