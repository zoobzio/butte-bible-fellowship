import type { ZodType } from "zod";

import type { Listing, TableFetch, TableService } from "~/types/listing";

import { useRequest } from "#imports";
import { useApi } from "~/composables/api";
import { toFetchResult, toListingQuery } from "~/utils/listing";

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
 * Loads a table for the page it sits on. Every visit fetches: the table's
 * state outlives the page, and its own `init` fetches once only, so going
 * through it would show the rows as they stood on the first visit. The
 * page, sort and filters the table holds are kept and asked for again.
 */
export const useTableRequest = <T>(table: TableService<T>) =>
  useRequest(`table:${table.id}`, async () => {
    await table.fetch();
    return true;
  });
