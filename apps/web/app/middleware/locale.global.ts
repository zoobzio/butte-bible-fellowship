import { defineNuxtRouteMiddleware, useLocale } from "#imports";
import { splitLocalePath } from "~/utils/locale";

/**
 * The route decides the locale: before a page renders, the app is switched
 * to the locale its path names. So a prerendered page is in its own
 * language, and following a link to another locale's page changes the
 * language with it.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { locale, setLocale } = useLocale();
  const wanted = splitLocalePath(to.path).locale;
  if (wanted !== locale.value) {
    await setLocale(wanted);
  }
});
