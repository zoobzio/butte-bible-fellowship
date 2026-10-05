import type { Ref } from "vue";

export interface MotionFrame {
  /**
   * Requests the callback on the next animation frame. Calls made while
   * one is already pending are dropped.
   */
  schedule: () => void;
}

export interface MotionScrollProgress {
  /** Page scroll as unit progress: 0 at the top, 1 at the page's foot. */
  progress: Readonly<Ref<number>>;
  /**
   * Re-reads the page immediately, for when its height changed without a
   * scroll or resize.
   */
  refresh: () => void;
}
