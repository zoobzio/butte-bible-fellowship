import type { ZodType } from "zod";

import { useAsyncData, useRoute } from "#imports";
import { useApi } from "~/composables/api";
import { isNotFound } from "~/utils/errors";

export const useRecord = <T>(
  kind: string,
  path: (id: number) => string,
  schema: ZodType<T>,
) => {
  const api = useApi();
  const id = Number(useRoute().params.id);
  const named = Number.isInteger(id) && id > 0;

  return useAsyncData(`${kind}:${id}`, async (): Promise<T | null> => {
    if (!named) return null;
    try {
      return schema.parse(await api(path(id)));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  });
};
