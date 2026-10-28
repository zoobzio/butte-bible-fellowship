import type { AppProsaryLocale } from "#imports";

import { computed, useLocale } from "#imports";
import { languageName } from "#layers/bbf/app/utils/locale";

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
