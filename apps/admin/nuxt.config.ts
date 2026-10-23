import { fileURLToPath } from "node:url";

import { defineNuxtConfig } from "nuxt/config";

import { prefix } from "@bbf/icons";
import icons from "@bbf/icons/config";
import sets from "@bbf/icons/sets";

const assets = fileURLToPath(
  new URL("src", import.meta.resolve("@bbf/assets/package.json")),
);

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@zoobzio/nuxt"],

  modules: [
    "@nuxt/fonts",
    "@icon-sheets/nuxt",
    "@untheme/nuxt",
    "@bezoar/nuxt",
  ],

  imports: { autoImport: false },

  components: { dirs: [] },

  devServer: { port: 3001 },

  iconSheets: { ...icons, sets, prefix },

  untheme: { preset: "@bbf/theme" },

  bezoar: { build: "@bbf/database", role: "admin" },

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

  css: ["@bbf/assets/css/index.css"],

  nitro: {
    publicAssets: [{ dir: assets }],
  },

  routeRules: {
    "/": { redirect: { to: "/staff", statusCode: 302 } },
    "/_nuxt/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/_fonts/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  },

  app: {
    head: {
      titleTemplate: "%s · BBF Admin",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "robots", content: "noindex, nofollow" },
      ],
    },
  },
});
