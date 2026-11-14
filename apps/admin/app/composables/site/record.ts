import type { ZodType } from "zod";

import { aboutRecord, connectRecord, homeRecord } from "@bbf/schema";
import { useAsyncData } from "#imports";
import { useApi } from "~/composables/api";
import { ABOUT, CONNECT, HOME } from "~/composables/site/routes";
import { isNotFound } from "~/utils/errors";

/**
 * A page of the site with a table of its own, read from the admin's API:
 * there is one of each, so its address names it. Nothing for a page whose
 * row is missing.
 */
const useSitePage = <T>(kind: string, path: string, schema: ZodType<T>) => {
  const api = useApi();

  return useAsyncData(`site:${kind}`, async (): Promise<T | null> => {
    try {
      return schema.parse(await api(path));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  });
};

export const useHomeRecord = () => useSitePage("home", HOME, homeRecord);

export const useAboutRecord = () => useSitePage("about", ABOUT, aboutRecord);

export const useConnectRecord = () =>
  useSitePage("connect", CONNECT, connectRecord);
