import { defineConfig } from "@untheme/kit";

/**
 * The site's theme: aurora with the site's tonal ramps. `bbf.resolver.json`
 * mirrors aurora's resolver, pointing at its files by `npm:/` reference, and
 * swaps in `tokens/colors/` for the ramps the site owns. The token set is
 * aurora's exactly, so every theme in aurora's catalog applies unchanged.
 * `untheme build` turns it into the modules in `.output/`.
 */
export default defineConfig({
  source: "./bbf.resolver.json",
  id: "bbf",
  outDir: ".output",
});
