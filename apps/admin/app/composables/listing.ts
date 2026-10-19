import type {
  DataTableFetchParams,
  DataTableFetchResult,
} from "@zoobzio/foundation/types/data/table";
import type { ZodType } from "zod";

import type { Listing } from "~/types/listing";

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

  return async (
    params: DataTableFetchParams,
  ): Promise<DataTableFetchResult<T>> => {
    const data = await api(path, { query: toListingQuery(params) });
    return toFetchResult(schema.parse(data), params.pageSize);
  };
};
