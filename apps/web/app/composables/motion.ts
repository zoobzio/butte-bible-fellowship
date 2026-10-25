import type { MotionFrame } from "~/types/motion";

import { onBeforeUnmount } from "vue";

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

