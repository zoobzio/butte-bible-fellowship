import type { AppProsaryLocale } from "#imports";

import { computed, useLocale } from "#imports";
import { languageName } from "#layers/bbf/app/utils/locale";

/**
 * The languages the app is written in, for the picker: the name of the one
 * being read, every language by its own name — `Español` — and `choose`,
 * which switches the app to one. The prosary module holds the choice in a
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

  const choose = (option: AppProsaryLocale): Promise<void> => setLocale(option);

  return { current, languages, choose };
};
