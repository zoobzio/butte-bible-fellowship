import { defineNuxtConfig } from "nuxt/config";

import iconSheets from "./config/icon-sheets";
import untheme from "./config/untheme";

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@zoobzio/foundation"],

  modules: ["@nuxt/content", "@nuxt/fonts"],

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

  css: ["~/assets/css/app.css"],

  untheme,

  iconSheets,

  content: {
    experimental: {
      nativeSqlite: true,
    },
  },

  // Build assets and fonts are content-hashed, so they can be cached forever.
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
      title: "Butte Bible Fellowship",
      htmlAttrs: { lang: "en" },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Butte Bible Fellowship — a Bible-teaching church community.",
        },
      ],
    },
  },
});
