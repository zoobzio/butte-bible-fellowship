import type { Locale } from "@bbf/prose";

import { computed, useLocale } from "#imports";
import { languageName } from "~/utils/locale";

/**
 * The languages the site is written in, for the picker: the name of the one
 * being read, every language by its own name — `Español` — and `choose`,
 * which switches the site to one. The prosary module holds the choice in a
 * cookie, so the next visit is read in it too.
 */
export const useLanguages = () => {
  const { locale, locales, setLocale } = useLocale();

  const current = computed(() => languageName(locale.value));

  const languages = computed(() =>
    locales.map((option) => ({
      locale: option,
      label: languageName(option),
      active: option === locale.value,
    })),
  );

  const choose = (option: Locale): Promise<void> => setLocale(option);

  return { current, languages, choose };
};
