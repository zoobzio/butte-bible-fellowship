import { defineConfig } from "@untheme/kit";

/**
 * The site's theme: aurora, taken as a preset, with the site's palette as the
 * base. `src/bbf.json` is the whole palette — all eight ramps, with its name
 * and description — in the format of aurora's own theme files. It joins the
 * `ramps` set after aurora's palette, so its stops win, and every role, every
 * modifier context and every theme of aurora follows it. Aurora's themes come
 * along as layers, and the site's palette is the first layer of the build:
 * the one a visitor comes back to. `untheme build` writes the modules, the
 * layer files and the preset manifest to `.output/`.
 */
export default defineConfig({
  source: "npm:/@untheme/aurora",
  id: "bbf",
  name: "Butte Bible Fellowship",
  extend: {
    description: "Brand blue, sunset orange and yellow on warm greys",
    sets: {
      ramps: { sources: [{ $ref: "./src/bbf.json" }] },
    },
  },
  outDir: ".output",
});
