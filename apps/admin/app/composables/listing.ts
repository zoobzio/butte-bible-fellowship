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

export const useTableRequest = <T>(table: TableService<T>) =>
  useRequest(`table:${table.id}`, () => table.init());
