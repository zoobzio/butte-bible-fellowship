import { defineNuxtConfig } from "nuxt/config";

import { prefix } from "@bbf/icons";
import icons from "@bbf/icons/config";
import sets from "@bbf/icons/sets";

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  modules: ["@nuxt/content", "@nuxt/fonts", "@icon-sheets/nuxt", "nuxt-studio"],

  iconSheets: { ...icons, sets, prefix },

  studio: {
    route: "/admin",
    repository: {
      provider: "github",
      owner: "zoobzio",
      repo: "butte-bible-fellowship",
      branch: "main",
      rootDir: "apps/web",
    },
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

  css: ["@bbf/theme/css", "~/assets/css/app.css"],

  content: {
    experimental: {
      nativeSqlite: true,
    },
  },

  nitro: {
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
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
