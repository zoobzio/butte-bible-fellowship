import { defineConfig, preset } from "@icon-sheets/kit";

export default defineConfig({
  id: "bbf",
  name: "Butte Bible Fellowship",
  extends: [preset("@zoobzio/icons")],
  icons: {
    badge: "lucide:badge-check",
    briefcase: "lucide:briefcase",
    "calendar-clock": "lucide:calendar-clock",
    "calendar-days": "lucide:calendar-days",
    "chevron-left": "lucide:chevron-left",
    "chevron-right": "lucide:chevron-right",
    clock: "lucide:clock",
    image: "lucide:image",
    languages: "lucide:languages",
    "log-out": "lucide:log-out",
    logo: "./src/logo.svg",
    // The table search's icon, rebound from the preset's wand to a magnifier
    // over code brackets: a search that takes a grammar.
    magic: "lucide:search-code",
    mail: "lucide:mail",
    menu: "lucide:menu",
    moon: "lucide:moon",
    palette: "lucide:palette",
    phone: "lucide:phone",
    play: "lucide:play",
    search: "lucide:search",
    sliders: "lucide:sliders-horizontal",
    sun: "lucide:sun",
    text: "lucide:text-align-start",
    user: "lucide:user",
    x: "lucide:x",
  },
  outDir: ".output",
});
