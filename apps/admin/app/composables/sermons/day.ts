import { useLocale } from "#imports";
import { toPreached } from "~/utils/sermons";

/**
 * The day a sermon was preached, as whoever is reading writes a day: in
 * their locale, and the same day in every time zone.
 */
export const useSermonDay = () => {
  const { locale } = useLocale();
  return (date: string): string => toPreached(date, locale.value);
};
