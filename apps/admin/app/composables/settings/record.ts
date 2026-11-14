import type { ZodType } from "zod";

import { aboutRecord, homeRecord } from "@bbf/schema";
import { useAsyncData } from "#imports";
import { useApi } from "~/composables/api";
import { ABOUT, HOME } from "~/composables/settings/routes";
import { isNotFound } from "~/utils/errors";

/**
 * A page of the site with a table of its own, read from the admin's API:
 * there is one of each, so its address names it. Nothing for a page whose
 * row is missing.
 */
const useSetting = <T>(kind: string, path: string, schema: ZodType<T>) => {
  const api = useApi();

  return useAsyncData(`settings:${kind}`, async (): Promise<T | null> => {
    try {
      return schema.parse(await api(path));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  });
};

export const useHomeRecord = () => useSetting("home", HOME, homeRecord);

export const useAboutRecord = () => useSetting("about", ABOUT, aboutRecord);
