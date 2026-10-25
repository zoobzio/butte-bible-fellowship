export interface MotionFrame {
  /**
   * Requests the callback on the next animation frame. Calls made while
   * one is already pending are dropped.
   */
  schedule: () => void;
}

