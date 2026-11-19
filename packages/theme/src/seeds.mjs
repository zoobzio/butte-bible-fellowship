/**
 * The seeds of the site's palette: one color for each of the eight ramps.
 * A seed gives its ramp a hue and a chroma, and aurora's generator the rest.
 * `scripts/generate.mjs` writes `bbf.json` from them, and the admin offers
 * them as the colors a ramp may be set to, and as what a ramp is until it is.
 */
export const seeds = Object.freeze({
  primary: "#0a68ff",
  secondary: "#ff9a5c",
  tertiary: "#ffde59",
  error: "#dc4a5e",
  success: "#57a53c",
  warning: "#c08a1f",
  neutral: "#7e7871",
  "neutral-variant": "#85776d",
});
