import type { ListingQuery } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type {
  Listing,
  TableConfig,
  TableDescriptors,
  TableFetchParams,
  TableFetchResult,
} from "~/types/listing";

/**
 * A table's config as the design system's factory takes it: the same, its
 * columns headed in words — each heading resolved by `name` from the
 * message the config heads it with.
 */
export const toTableDescriptors = <T>(
  config: TableConfig<T>,
  name: (message: AppProsaryMessage) => string,
): TableDescriptors<T> => ({
  ...config,
  columns: config.columns.map((column) => ({
    ...column,
    label: name(column.label),
  })),
});

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
