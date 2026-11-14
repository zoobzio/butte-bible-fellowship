import type { Root } from "hast";

import type { PageItem } from "~/types/page";

import { connectPage, homePage, page as plain } from "@bbf/schema";
import { CONTENT, PREFIX } from "@prosary/nuxt/constant";

import { useAsyncData, useLocale, useRequestFetch, useRoute } from "#imports";

/** What reads a page's front matter: a schema of it. */
interface Reader<Matter> {
  parse: (matter: unknown) => Matter;
}

const fileOf = (path: string) =>
  `${path === "/" ? "index" : path.slice(1)}.json`;

const isNotFound = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { status?: unknown }).status === 404;

/**
 * The page at a path: its front matter, read through the schema given,
 * beside what is written on it. Nothing for a path with no page.
 */
const read = <Matter>(path: string, schema: Reader<Matter>) => {
  const { locale } = useLocale();
  const request = useRequestFetch();

  return useAsyncData(
    `page:${path}`,
    async (): Promise<PageItem<Matter> | null> => {
      let body: Root;
      try {
        body = await request<Root>(
          `${PREFIX}/${CONTENT}/${locale.value}/${fileOf(path)}`,
          { responseType: "json" },
        );
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
      return { ...schema.parse(body.data?.matter ?? {}), body };
    },
    { watch: [locale] },
  );
};

/** A page with no layout of its own: the route's, unless one is named. */
export const usePage = (page?: string) => read(page ?? useRoute().path, plain);

/** The home page: its hero in its front matter, over what is written. */
export const useHomePage = () => read("/", homePage);

/** About Us: the title and description it opens with, over what is written. */
export const useAboutPage = () => read("/about-us", plain);

/**
 * The connect page: the title and description it opens with, and how to
 * find and reach the church, over what is written.
 */
export const useConnectPage = () => read("/connect", connectPage);
