import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@bbf/nuxt"],

  devServer: { port: 3001 },

  bezoar: { role: "admin" },

  routeRules: {
    "/": { redirect: { to: "/staff", statusCode: 302 } },
  },

  app: {
    head: {
      titleTemplate: "%s · BBF Admin",
      meta: [{ name: "robots", content: "noindex, nofollow" }],
    },
  },
});
