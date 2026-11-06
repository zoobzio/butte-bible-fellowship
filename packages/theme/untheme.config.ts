import { defineConfig } from "@untheme/kit";

export default defineConfig({
  source: "npm:/@zoobzio/theme",
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
