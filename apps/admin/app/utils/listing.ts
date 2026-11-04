import type {
  Listing,
  ListingRequest,
  TableFetchParams,
  TableFetchResult,
} from "~/types/listing";

/**
 * The query key of a committed filter: the column's key, and for an
 * operator filter the operator after it, each of its words capitalised:
 * `updatedAtBefore`, `nameStartsWith`.
 */
const keyOf = ({ key, op }: TableFetchParams["filters"][number]): string =>
  op === undefined
    ? key
    : `${key}${op
        .split(" ")
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join("")}`;

/**
 * What a table asks the API for: the page, the free text as `q`, one
 * column filter per key, and the sort as `sort` and `direction` once a
 * column is sorted. Unsorted, the API lists in its own order.
 */
export const toListingQuery = ({
  page,
  pageSize,
  sortField,
  sortDirection,
  query,
  filters,
}: TableFetchParams): ListingRequest => ({
  ...Object.fromEntries(filters.map((filter) => [keyOf(filter), filter.value])),
  page,
  size: pageSize,
  ...(query === "" ? {} : { q: query }),
  ...(sortField === null ? {} : { sort: sortField, direction: sortDirection }),
});

export const toFetchResult = <T>(
  listing: Listing<T>,
  size: number,
): TableFetchResult<T> => ({
  data: listing.items,
  total: listing.total,
  pageCount: Math.max(1, Math.ceil(listing.total / size)),
});
