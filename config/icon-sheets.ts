import { defineNuxtIconSheetsConfig } from "@icon-sheets/nuxt/config";

/**
 * App-side additions to the foundation layer's icon aliases. A record of
 * plain strings, so the layer merge composes safely (unlike untheme's token
 * documents, which need the modules:before replacement in nuxt.config).
 */
export default defineNuxtIconSheetsConfig({
  icons: {
    menu: "lucide:menu",
    moon: "lucide:moon",
    sun: "lucide:sun",
  },
});
