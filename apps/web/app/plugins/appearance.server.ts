import { defineNuxtPlugin } from "#imports";

import { useSiteAppearance } from "~/composables/appearance";

/**
 * Lays what the admin set over the theme before anything renders, on the
 * server alone: the response already looks as it was set, and what was
 * laid rides to the browser in the payload, which asks for nothing. It
 * runs after the theme's own plugin, which by then has read a visitor's
 * choices from their cookies: those are what the defaults give way to.
 */
export default defineNuxtPlugin({
  name: "appearance",
  dependsOn: ["untheme"],
  setup: async () => {
    await useSiteAppearance().load();
  },
});
