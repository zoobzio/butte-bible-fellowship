import { fileURLToPath } from "node:url";

import { defineNuxtConfig } from "nuxt/config";

const assets = fileURLToPath(
  new URL("src", import.meta.resolve("@bbf/assets/package.json")),
);

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  $meta: { name: "bbf" },

  extends: ["@zoobzio/nuxt"],

  modules: [
    "@nuxt/fonts",
    "@icon-sheets/nuxt",
    "@untheme/nuxt",
    "@bezoar/nuxt",
    "@prosary/nuxt",
  ],

  imports: { autoImport: false },

  components: { dirs: [] },

  iconSheets: { preset: "@bbf/icons" },

  untheme: { preset: "@bbf/theme" },

  bezoar: { build: "@bbf/database" },

  prosary: { build: "@bbf/prose" },

  $development: {
    bezoar: { driver: "pglite", migrate: true, roles: true, seed: true },
  },

  fonts: {
    families: [
      {
        name: "Newsreader",
        provider: "google",
        preload: true,
        weights: [400, 500],
        styles: ["normal", "italic"],
        subsets: ["latin"],
      },
      {
        name: "Work Sans",
        provider: "google",
        preload: true,
        weights: [400, 500, 700],
        styles: ["normal", "italic"],
        subsets: ["latin"],
      },
    ],
  },

  css: [fileURLToPath(import.meta.resolve("@bbf/assets/css/index.css"))],

  nitro: {
    publicAssets: [{ dir: assets }],
  },

  routeRules: {
    "/_nuxt/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/_fonts/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  },

  app: {
    head: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
