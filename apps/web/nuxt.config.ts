import { fileURLToPath } from "node:url";

import { defineNuxtConfig } from "nuxt/config";

import { locale as source, locales } from "@bbf/i18n";
import { prefix } from "@bbf/icons";
import icons from "@bbf/icons/config";
import sets from "@bbf/icons/sets";
import untheme from "@bbf/theme/config";

import { SERMONS_MAX_AGE } from "./shared/constants/sermons";

/** The locales the site is translated to: each has its pages under `/<locale>`. */
const targets = locales.filter((locale) => locale !== source);

/**
 * The pages rendered by the server when they are asked for, rather than once
 * at build: what they show changes without a deploy.
 */
const live = ["/sermons"];

/** The English pages, as authored: `@bbf/i18n`'s sources, beside its build. */
const content = fileURLToPath(
  new URL("../src/content", import.meta.resolve("@bbf/i18n")),
);

/** The static assets: `@bbf/assets`'s sources, served from the site's root. */
const assets = fileURLToPath(
  new URL("src", import.meta.resolve("@bbf/assets/package.json")),
);

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

  runtimeConfig: {
    public: {
      // The channel whose sermons `/sermons` lists, by its YouTube id.
      youtube: { channel: "UCCVz4wFgCBmw-Iwyz61OPng" },
    },
  },

  studio: {
    route: "/admin",
    repository: {
      provider: "github",
      owner: "zoobzio",
      repo: "butte-bible-fellowship",
      branch: "main",
      rootDir: "apps/web",
      // Where Studio commits: the pages and the media each have a package.
      paths: {
        content: "packages/i18n/src/content",
        public: "packages/assets/src",
      },
    },
    // The same two directories on disk, for a local Studio.
    source: { content, public: assets },
    // Only English is authored: the translations are generated from it.
    collections: { exclude: targets.map((locale) => `pages_${locale}`) },
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
    publicAssets: [{ dir: assets }],
    prerender: {
      routes: ["/", ...targets.map((locale) => `/${locale}`)],
      crawlLinks: true,
    },
  },

  routeRules: {
    // A live page, in every locale, is rendered on request and that render
    // kept as long as the sermons are: the crawler must not prerender it.
    ...Object.fromEntries(
      live
        .flatMap((path) => [
          path,
          ...targets.map((locale) => `/${locale}${path}`),
        ])
        .map((path) => [path, { prerender: false, swr: SERMONS_MAX_AGE }]),
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
