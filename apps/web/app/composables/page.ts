import type { Root } from "hast";

import type { PageItem } from "~/types/page";

import { page as schema } from "@bbf/validators";
import { CONTENT_URL } from "@prosary/nuxt/constant";

import { useAsyncData, useRequestFetch, useRoute } from "#imports";
import { splitLocalePath } from "~/utils/locale";

/** The file a page is built to, by the page's path: `/` is `index.json`. */
const fileOf = (path: string) =>
  `${path === "/" ? "index" : path.slice(1)}.json`;

/** Whether a fetch failed because there is nothing at the address. */
const isNotFound = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { status?: unknown }).status === 404;

/**
 * A page, in the locale the route names. `@bbf/i18n` builds every page for
 * every locale as the tree it renders to, its front matter on the root, and
 * the prosary module serves them all; the route's locale picks which, and a
 * page's path is the same in all of them. A page component asks for its own
 * page by `path`; left out, the page is the one the route names. A path
 * with no page is `null`.
 */
export const usePage = (page?: string) => {
  const route = splitLocalePath(useRoute().path);
  const { locale } = route;
  const path = page ?? route.path;
  const request = useRequestFetch();

  return useAsyncData(
    `page:${locale}:${path}`,
    async (): Promise<PageItem | null> => {
      let body: Root;
      try {
        body = await request<Root>(`${CONTENT_URL}/${locale}/${fileOf(path)}`, {
          responseType: "json",
        });
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
      return { ...schema.parse(body.data?.matter ?? {}), body };
    },
  );
};
