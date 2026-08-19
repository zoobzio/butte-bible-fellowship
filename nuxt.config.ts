import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2026-08-19",

  extends: ["@zoobzio/foundation"],

  css: ["~/assets/css/app.css"],

  app: {
    head: {
      title: "Butte Bible Fellowship",
      htmlAttrs: { lang: "en" },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Butte Bible Fellowship — a Bible-teaching church community.",
        },
      ],
    },
  },
});
