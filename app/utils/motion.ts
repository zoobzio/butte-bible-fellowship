/** Clamp a number to the unit interval. */
export const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

/** Cubic ease-out over the unit interval. */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * A scroll offset as unit progress through a document's scrollable range —
 * 0 at the top, 1 with the viewport at the document's foot.
 */
export const scrollProgress = (
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number,
): number => clamp01(scrollY / Math.max(1, scrollHeight - viewportHeight));
