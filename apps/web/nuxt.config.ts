import { defineNuxtConfig } from "nuxt/config";

import { locale as source, locales } from "@bbf/i18n";
import { prefix } from "@bbf/icons";
import icons from "@bbf/icons/config";
import sets from "@bbf/icons/sets";
import untheme from "@bbf/theme/config";

/** The locales the site is translated to: each has its pages under `/<locale>`. */
const targets = locales.filter((locale) => locale !== source);

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@zoobzio/foundation"],

  modules: [
    "@nuxt/content",
    "@nuxt/fonts",
    "@icon-sheets/nuxt",
    "@untheme/nuxt",
    "@fibber/nuxt",
    "nuxt-studio",
  ],

  imports: { autoImport: false },

  components: { dirs: [] },

  iconSheets: { ...icons, sets, prefix },

  untheme,

  fibber: { build: "@bbf/i18n" },

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

  css: ["~/assets/css/app.css"],

  content: {
    experimental: {
      nativeSqlite: true,
    },
  },

  hooks: {
    // English keeps the routes as the pages declare them; every other
    // locale gets the same pages again under its own prefix.
    "pages:extend": (pages) => {
      const own = pages.filter((page) => page.file?.includes("/app/pages/"));
      for (const locale of targets) {
        for (const page of own) {
          pages.push({
            ...page,
            name: `${page.name}___${locale}`,
            path: page.path === "/" ? `/${locale}` : `/${locale}${page.path}`,
          });
        }
      }
    },
  },

  nitro: {
    prerender: {
      routes: ["/", ...targets.map((locale) => `/${locale}`)],
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
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
