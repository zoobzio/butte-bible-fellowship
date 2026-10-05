import { computed, useRoute } from "#imports";
import { isSitePath, joinLocalePath, splitLocalePath } from "~/utils/locale";

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
