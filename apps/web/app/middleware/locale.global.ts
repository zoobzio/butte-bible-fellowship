import { defineNuxtRouteMiddleware } from "#imports";
import { useSelectedLocale } from "~/composables/locale";

/**
 * The route decides the locale: before a page renders, the app is switched
 * to the locale its path names.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  await useSelectedLocale().select(to.path);
});
