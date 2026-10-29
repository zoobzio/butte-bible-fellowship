import { defineConfig, preset } from "@icon-sheets/kit";

export default defineConfig({
  id: "bbf",
  name: "Butte Bible Fellowship",
  extends: [preset("@zoobzio/icons")],
  icons: {
    "chevron-left": "lucide:chevron-left",
    "chevron-right": "lucide:chevron-right",
    languages: "lucide:languages",
    "log-out": "lucide:log-out",
    logo: "./src/logo.svg",
    menu: "lucide:menu",
    moon: "lucide:moon",
    palette: "lucide:palette",
    play: "lucide:play",
    search: "lucide:search",
    sliders: "lucide:sliders-horizontal",
    sun: "lucide:sun",
    x: "lucide:x",
  },
  outDir: ".output",
});
