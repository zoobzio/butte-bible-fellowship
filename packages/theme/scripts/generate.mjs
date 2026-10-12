/**
 * Generates the site's palette as DTCG JSON. The script writes one token
 * document, `src/bbf.json`, with the name, the description and the eight
 * ramps of the theme. The ramps come from aurora's generator, so they share
 * its lightness ladder and its chroma curve, and every stop sits where
 * aurora's does. The palette rebinds the `ramps` set of aurora, and every
 * role of aurora resolves from it.
 *
 * Run `pnpm generate && pnpm format`.
 */
import { writeFile } from "node:fs/promises";

import { palette } from "@untheme/aurora/ramp";

/**
 * The theme: brand blue, sunset orange and yellow on warm greys. The `error`,
 * `success` and `warning` seeds are aurora's.
 */
const BBF = {
  name: "Butte Bible Fellowship",
  description: "Brand blue, sunset orange and yellow on warm greys",
  seeds: {
    primary: "#0a68ff",
    secondary: "#ff9a5c",
    tertiary: "#ffde59",
    error: "#dc4a5e",
    success: "#57a53c",
    warning: "#c08a1f",
    neutral: "#7e7871",
    "neutral-variant": "#85776d",
  },
};

await writeFile(
  new URL("../src/bbf.json", import.meta.url),
  `${JSON.stringify(palette(BBF), null, 2)}\n`,
);

console.log("generated src/bbf.json");
