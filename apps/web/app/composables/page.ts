import { queryCollection, useAsyncData, useRoute } from "#imports";
import { splitLocalePath } from "~/utils/locale";

/**
 * The page the route names, in the locale the route names. `@bbf/i18n`
 * builds every page for every locale and `content.config.ts` gives each
 * locale a collection of its own, so the route's locale picks the collection
 * and the rest of its path is the same in all of them. A path with no page
 * is `null`.
 */
export const usePage = () => {
  const { locale, path } = splitLocalePath(useRoute().path);

  return useAsyncData(`page:${locale}:${path}`, () =>
    queryCollection(`pages_${locale}`).path(path).first(),
  );
};
