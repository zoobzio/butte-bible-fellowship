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
    // A moved page sends its old address to its new one.
    "/calendar": { redirect: { to: "/events", statusCode: 301 } },
    // The site once led a translated page's address with its locale. Those
    // addresses lead to the page itself; the language is the visitor's own.
    ...Object.fromEntries(
      translated.flatMap((locale) => [
        [`/${locale}`, { redirect: { to: "/", statusCode: 301 } }],
        [`/${locale}/**`, { redirect: { to: "/**", statusCode: 301 } }],
      ]),
    ),
  },
});
