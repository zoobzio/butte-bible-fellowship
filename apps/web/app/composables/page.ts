import { queryCollection, useAsyncData, useRoute } from "#imports";
import { splitLocalePath } from "~/utils/locale";

/**
 * A page, in the locale the route names. `@bbf/i18n` builds every page for
 * every locale and `content.config.ts` gives each locale a collection of its
 * own, so the route's locale picks the collection and a page's path is the
 * same in all of them. A page component asks for its own page by `path`;
 * left out, the page is the one the route names. A path with no page is
 * `null`.
 */
export const usePage = (page?: string) => {
  const route = splitLocalePath(useRoute().path);
  const { locale } = route;
  const path = page ?? route.path;

  return useAsyncData(`page:${locale}:${path}`, () =>
    queryCollection(`pages_${locale}`).path(path).first(),
  );
};
