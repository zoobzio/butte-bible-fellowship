import type { Locale } from "@bbf/prose";

/** A language's name in that language, capitalized: `Español`. */
export const languageName = (locale: Locale): string => {
  const name =
    new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};
