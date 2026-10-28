import type { AppProsaryLocale } from "#imports";

/** A language's name in that language, capitalized: `Español`. */
export const languageName = (locale: AppProsaryLocale): string => {
  const name =
    new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};
