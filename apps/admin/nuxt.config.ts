import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@bbf/nuxt"],

  modules: ["@letters-patent/nuxt"],

  // The admin's contract is the kit build of `@bbf/patents`.
  lettersPatent: { preset: "@bbf/patents" },

  // Google sign-in: the OAuth client, and the secret the session cookie is
  // sealed under. Each is set from the environment; see `.env.example`.
  runtimeConfig: {
    google: { clientId: "", clientSecret: "" },
    sessionSecret: "",
  },

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
