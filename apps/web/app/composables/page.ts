import type { Root } from "hast";

import type { PageItem } from "~/types/page";

import { page as schema } from "@bbf/schema";
import { CONTENT_URL } from "@prosary/nuxt/constant";

import { useAsyncData, useLocale, useRequestFetch, useRoute } from "#imports";

const fileOf = (path: string) =>
  `${path === "/" ? "index" : path.slice(1)}.json`;

const isNotFound = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { status?: unknown }).status === 404;

export const usePage = (page?: string) => {
  const { locale } = useLocale();
  const path = page ?? useRoute().path;
  const request = useRequestFetch();

  return useAsyncData(
    `page:${path}`,
    async (): Promise<PageItem | null> => {
      let body: Root;
      try {
        body = await request<Root>(
          `${CONTENT_URL}/${locale.value}/${fileOf(path)}`,
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
