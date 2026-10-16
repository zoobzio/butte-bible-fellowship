import { fileURLToPath } from "node:url";

import { defineNuxtConfig } from "nuxt/config";

import { locale as source, locales } from "@bbf/i18n";
import { prefix } from "@bbf/icons";
import icons from "@bbf/icons/config";
import sets from "@bbf/icons/sets";

/** The locales the site is translated to: each has its pages under `/<locale>`. */
const targets = locales.filter((locale) => locale !== source);

/** A page's path in a locale: `/es/about-us`, and `/es` for the home page. */
const localized = (locale: string, path: string) =>
  path === "/" ? `/${locale}` : `/${locale}${path}`;

/** The pages that have moved: the path each was at, and where it is now. */
const moved = { "/calendar": "/events" };

/** The static assets: `@bbf/assets`'s sources, served from the site's root. */
const assets = fileURLToPath(
  new URL("src", import.meta.resolve("@bbf/assets/package.json")),
);

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@zoobzio/foundation"],

  modules: [
    "@nuxt/fonts",
    "@icon-sheets/nuxt",
    "@untheme/nuxt",
    "@prosary/nuxt",
  ],

  imports: { autoImport: false },

  components: { dirs: [] },

  iconSheets: { ...icons, sets, prefix },

  // The theme is a preset: its base, its boot selection and its layers —
  // the site's palette and every aurora theme — are the package's own build.
  untheme: { preset: "@bbf/theme" },

  // The words and the pages are `@bbf/i18n`'s build: the module provides
  // `$t` over its messages and serves its pages, every locale's, to `usePage`.
  prosary: { build: "@bbf/i18n" },

  runtimeConfig: {
    public: {
      // The channel whose sermons `/sermons` lists, by its YouTube id.
      youtube: { channel: "UCCVz4wFgCBmw-Iwyz61OPng" },
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

  css: ["@bbf/assets/css/index.css"],

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
            path: localized(locale, page.path),
          });
        }
      }
    },
  },

  nitro: {
    publicAssets: [{ dir: assets }],
  },

  routeRules: {
    // A moved page, in every locale, sends its old address to its new one.
    ...Object.fromEntries(
      Object.entries(moved).flatMap(([from, to]) =>
        ["", ...targets.map((locale) => `/${locale}`)].map((prefix) => [
          `${prefix}${from}`,
          { redirect: { to: `${prefix}${to}`, statusCode: 301 } },
        ]),
      ),
    ),
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
