import type { ListingQuery } from "@bbf/schema/types";

import type {
  Listing,
  TableFetchParams,
  TableFetchResult,
} from "~/types/listing";

/** The query of a listing, from what the table asks for: its page and page size. */
export const toListingQuery = ({
  page,
  pageSize,
}: TableFetchParams): ListingQuery => ({ page, size: pageSize });

/**
 * What the table shows, from the page the API answered with: the items as
 * its rows, the total, and how many pages there are at the size asked —
 * one at least, so an empty list is still a page.
 */
export const toFetchResult = <T>(
  listing: Listing<T>,
  size: number,
): TableFetchResult<T> => ({
  data: listing.items,
  total: listing.total,
  pageCount: Math.max(1, Math.ceil(listing.total / size)),
});
