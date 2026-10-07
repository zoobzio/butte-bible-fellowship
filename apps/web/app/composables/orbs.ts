import type { OrbDriftOptions } from "~/types/orbs";

import { computed, onMounted, ref, watch } from "vue";

import { useUntheme } from "#imports";
import { MOTION_REDUCED_QUERY } from "~/constants/motion";
import { orbDrift } from "~/utils/orbs";
import { useFrame, useScrollProgress } from "~/composables/motion";

/**
 * Drives the two drifting background orbs: they move in opposite directions
 * with scroll progress, and hold still against scroll when motion is
 * reduced — by the theme's motion setting, or by the system's
 * prefers-reduced-motion. Returns `schedule` so the caller can request a
 * repaint (e.g. after navigation changes page height).
 */
export const useOrbDrift = ({ left, right }: OrbDriftOptions) => {
  const { progress, refresh } = useScrollProgress();
  const untheme = useUntheme();
  const system = ref(false);
  const reduced = computed(
    () => system.value || untheme.config.input.motion === "reduced",
  );

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
    if (!reduced.value) paint();
  });

  onMounted(() => {
    system.value = window.matchMedia(MOTION_REDUCED_QUERY).matches;
    repaint();
  });

  return { schedule };
};
