import { defineConfig } from "@untheme/kit";

/**
 * The site's theme: aurora, with the site's palette added to its `theme`
 * modifier as the `bbf` context and booted by default. `src/bbf.json` is the
 * whole palette — all eight ramps, with its name and description — in the
 * format of aurora's own theme files, and every aurora theme stays a context
 * beside it. `untheme build` turns it into the modules in `.output/`.
 */
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
  id: "bbf",
  name: "Butte Bible Fellowship",
  outDir: ".output",
  modifiers: {
    theme: {
      add: { bbf: "./src/bbf.json" },
      default: "bbf",
    },
  },
});
