import type { ZodType } from "zod";

import type {
  Listing,
  TableFetch,
  TableRecord,
  TableService,
} from "~/types/listing";

import { useRequest } from "#imports";
import { useApi } from "~/composables/api";
import { toFetchResult, toListingQuery } from "~/utils/listing";

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
