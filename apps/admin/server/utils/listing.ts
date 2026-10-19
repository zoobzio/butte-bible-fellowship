import type { ListingQuery } from "@bbf/schema/types";

import type { Listing } from "~~/server/types/listing";

/**
 * One page of a list, as the query asks for it: the items on that page,
 * counted from the first, and how many there are in all. A page past the
 * end holds none. The admin's queries list everything, so the page is cut
 * here, over what they return.
 */
export const paginate = <T>(
  items: T[],
  { page, size }: ListingQuery,
): Listing<T> => ({
  items: items.slice((page - 1) * size, page * size),
  total: items.length,
});
