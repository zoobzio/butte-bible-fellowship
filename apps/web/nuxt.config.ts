import { defineNuxtConfig } from "nuxt/config";

import { locale as source, locales } from "@bbf/prose";

const translated = locales.filter((locale) => locale !== source);

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@bbf/nuxt"],

  bezoar: { role: "web" },

  runtimeConfig: {
    public: {
      youtube: { channel: "UCCVz4wFgCBmw-Iwyz61OPng" },
    },
  },

  routeRules: {
    "/calendar": { redirect: { to: "/events", statusCode: 301 } },
    ...Object.fromEntries(
      translated.flatMap((locale) => [
        [`/${locale}`, { redirect: { to: "/", statusCode: 301 } }],
        [`/${locale}/**`, { redirect: { to: "/**", statusCode: 301 } }],
      ]),
    ),
  },
});
