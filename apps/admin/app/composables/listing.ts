import type { ZodType } from "zod";

import type {
  Listing,
  TableFetch,
  TableRefresh,
  TableRecord,
  TableService,
} from "~/types/listing";

import { useRequest } from "#imports";
import { useApi } from "~/composables/api";
import { answered, toFetchResult, toListingQuery } from "~/utils/listing";

export const useListingFetch = <T extends TableRecord>(
  path: string,
  schema: ZodType<Listing<T>>,
) => {
  const api = useApi();

  const fetch: TableFetch<T> = async (params) => {
    const data = await api(path, { query: toListingQuery(params) });
    return toFetchResult(schema.parse(data));
  };

  return fetch;
};

/**
 * The poll of a table's sync, over the same route as its fetch: the page
 * the table shows, asked for with the mark it was last read at. The API
 * answers nothing where the list still stands, and the page as it now is,
 * with the mark to ask with next, where anything was added, changed or
 * removed.
 */
export const useListingRefresh = <T extends TableRecord>(
  path: string,
  schema: ZodType<Listing<T>>,
) => {
  const api = useApi();

  const refresh: TableRefresh<T> = async ({ since, ...params }) => {
    const data = await api(path, {
      query: { ...toListingQuery(params), since },
    });
    return answered(data) ? toFetchResult(schema.parse(data)) : null;
  };

  return refresh;
};

/**
 * Loads a table for the page it sits on. Every visit fetches: the table's
 * state outlives the page, and what it lists may have changed since. Its
 * own `init` fetches once only, and is what lets a saved view put in place
 * later list afresh: so the first visit goes through it, as a browser's
 * does, and the page, sort and filters the table holds are kept and asked
 * for again on the rest.
 */
export const useTableRequest = <T extends TableRecord>(
  table: TableService<T>,
) =>
  useRequest(`table:${table.id}`, async () => {
    await (table.initialized ? table.fetch() : table.init());
    return true;
  });
