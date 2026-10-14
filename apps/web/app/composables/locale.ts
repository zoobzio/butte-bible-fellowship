import { computed, useLocale, useRoute } from "#imports";
import {
  isSitePath,
  joinLocalePath,
  languageName,
  splitLocalePath,
} from "~/utils/locale";

/**
 * The route as the site reads it: the locale its path names, the page's own
 * path without it, and `localize`, which keeps a link to another page in the
 * locale the visitor is reading. A link off the site passes through as is.
 */
export const useRouteLocale = () => {
  const route = useRoute();

  const current = computed(() => splitLocalePath(route.path));
  const locale = computed(() => current.value.locale);
  const path = computed(() => current.value.path);

  const localize = (to: string) => {
    return isSitePath(to) ? joinLocalePath(locale.value, to) : to;
  };

  return { locale, path, localize };
};

/**
 * The languages the site is written in, for the picker: the name of the one
 * being read, and every language by its own name — `Español` — with a link
 * to the page being read in it.
 */
export const useLanguages = () => {
  const { locales } = useLocale();
  const { locale, path } = useRouteLocale();

  const current = computed(() => languageName(locale.value));

  const languages = computed(() =>
    locales.map((option) => ({
      label: languageName(option),
      to: joinLocalePath(option, path.value),
    })),
  );

  return { current, languages };
};

/**
 * Switches the app to the locale a path names, when it is not the one
 * already set: what the route middleware does before a page renders, so a
 * page the server renders is in its own language, and following a link to
 * another locale's page changes the language with it.
 */
export const useSelectedLocale = () => {
  const { locale, setLocale } = useLocale();

  const select = async (path: string): Promise<void> => {
    const wanted = splitLocalePath(path).locale;
    if (wanted !== locale.value) {
      await setLocale(wanted);
    }
  };

  return { locale, select };
};
