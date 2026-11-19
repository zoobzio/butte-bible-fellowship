/** A ramp of the palette: what a seed is the color of. */
export type Ramp =
  | "primary"
  | "secondary"
  | "tertiary"
  | "error"
  | "success"
  | "warning"
  | "neutral"
  | "neutral-variant";

/** The seeds of the site's palette: a hex color for each ramp. */
export declare const seeds: { readonly [R in Ramp]: string };
