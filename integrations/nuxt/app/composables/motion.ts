import type { MotionFrame } from "#layers/bbf/app/types/motion";

import { onBeforeUnmount } from "vue";

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
