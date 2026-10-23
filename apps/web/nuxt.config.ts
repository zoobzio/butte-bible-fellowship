import { fileURLToPath } from "node:url";

import { defineNuxtConfig } from "nuxt/config";

import { locale as source, locales } from "@bbf/prose";
import { prefix } from "@bbf/icons";
import icons from "@bbf/icons/config";
import sets from "@bbf/icons/sets";

const targets = locales.filter((locale) => locale !== source);

const localized = (locale: string, path: string) =>
  path === "/" ? `/${locale}` : `/${locale}${path}`;

const moved = { "/calendar": "/events" };

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
    "@prosary/nuxt",
    "@bezoar/nuxt",
  ],

  imports: { autoImport: false },

  components: { dirs: [] },

  iconSheets: { ...icons, sets, prefix },

  untheme: { preset: "@bbf/theme" },

  prosary: { build: "@bbf/prose" },

  bezoar: { build: "@bbf/database", role: "web" },

  $development: {
    bezoar: { driver: "pglite", migrate: true, roles: true, seed: true },
  },

  runtimeConfig: {
    public: {
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
