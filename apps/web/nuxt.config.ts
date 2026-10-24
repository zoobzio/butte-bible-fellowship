import { defineNuxtConfig } from "nuxt/config";

import { locale as source, locales } from "@bbf/prose";

const targets = locales.filter((locale) => locale !== source);

const localized = (locale: string, path: string) =>
  path === "/" ? `/${locale}` : `/${locale}${path}`;

const moved = { "/calendar": "/events" };

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@bbf/nuxt"],

  modules: ["@prosary/nuxt"],

  prosary: { build: "@bbf/prose" },

  bezoar: { role: "web" },

  runtimeConfig: {
    public: {
      youtube: { channel: "UCCVz4wFgCBmw-Iwyz61OPng" },
    },
  },

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

  // A moved page, in every locale, sends its old address to its new one.
  routeRules: Object.fromEntries(
    Object.entries(moved).flatMap(([from, to]) =>
      ["", ...targets.map((locale) => `/${locale}`)].map((prefix) => [
        `${prefix}${from}`,
        { redirect: { to: `${prefix}${to}`, statusCode: 301 } },
      ]),
    ),
  ),
});
