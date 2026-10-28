import type { ListingQuery } from "@bbf/schema/types";

import type { Listing } from "~~/server/types/listing";

export const paginate = <T>(
  items: T[],
  { page, size }: ListingQuery,
): Listing<T> => ({
  items: items.slice((page - 1) * size, page * size),
  total: items.length,
});
