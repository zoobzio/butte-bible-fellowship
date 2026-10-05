import type { Locale } from "@bbf/i18n";

import { isLocale, locale as source } from "@bbf/i18n";

/** A route's path taken apart: its locale, and the page's own path. */
export interface LocalePath {
  locale: Locale;
  path: string;
}

/**
 * Takes a route's path apart. English, the source locale, has no prefix:
 * `/about-us` is the English page. Every other locale leads the path:
 * `/es/about-us` is the same page in Spanish, and `/es` the home page.
 */
export const splitLocalePath = (full: string): LocalePath => {
  const [, first = "", ...rest] = full.split("/");
  if (first !== source && isLocale(first)) {
    return { locale: first, path: `/${rest.join("/")}` };
  }
  return { locale: source, path: full };
};

/** A page's path in a locale: the inverse of {@link splitLocalePath}. */
export const joinLocalePath = (locale: Locale, path: string): string => {
  if (locale === source) {
    return path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

/** Whether a link stays on the site: a path from the root, not a URL. */
export const isSitePath = (to: string): boolean => {
  return to.startsWith("/") && !to.startsWith("//");
};

/** A language's name in that language, capitalized: `Español`. */
export const languageName = (locale: Locale): string => {
  const name =
    new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};
