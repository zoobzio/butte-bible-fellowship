import type { MotionFrame, MotionScrollProgress } from "~/types/motion";

import { onBeforeUnmount, onMounted, readonly, ref } from "vue";

import { scrollProgress } from "~/utils/motion";

/**
 * Throttles `callback` to animation frames: however many times `schedule`
 * is called before the next frame, the callback runs once. A pending frame
 * is cancelled on unmount.
 */
export const useFrame = (callback: () => void): MotionFrame => {
  let frame = 0;

  const run = () => {
    frame = 0;
    callback();
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(run);
  };

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    frame = 0;
  });

  return { schedule };
};

/**
 * The page's scroll progress as a ref, read on mount and then at most once
 * per frame as the window scrolls or resizes. `refresh` re-reads it on
 * demand. Listeners are torn down on unmount.
 */
export const useScrollProgress = (): MotionScrollProgress => {
  const progress = ref(0);

  const refresh = () => {
    progress.value = scrollProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
  };

  const { schedule } = useFrame(refresh);

  onMounted(() => {
    refresh();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  });

  return { progress: readonly(progress), refresh };
};
