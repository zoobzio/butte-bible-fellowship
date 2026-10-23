import type { ZodType } from "zod";

import type { Listing, TableFetch, TableService } from "~/types/listing";

import { useRequest } from "#imports";
import { useApi } from "~/composables/api";
import { toFetchResult, toListingQuery } from "~/utils/listing";

/**
 * The fetch a table runs: one page of a listing from the admin's own API,
 * at the page and size the table asks for, checked against what the
 * listing is, and handed back as the rows, the total and the page count.
 */
export const useListingFetch = <T>(
  path: string,
  schema: ZodType<Listing<T>>,
) => {
  const api = useApi();

  const fetch: TableFetch<T> = async (params) => {
    const data = await api(path, { query: toListingQuery(params) });
    return toFetchResult(schema.parse(data), params.pageSize);
  };

  return fetch;
};

/**
 * The request a listing page makes on load: the table's first page. It
 * runs during SSR and blocks navigation until it settles, and it runs
 * once: the key is the table's, so Nuxt dedupes it, and `init` is a no-op
 * on a table already initialized, so neither hydration nor a return to the
 * page fetches again. The page awaits it in setup.
 */
export const useTableRequest = <T>(table: TableService<T>) =>
  useRequest(`table:${table.id}`, () => table.init());
