import type {
  Listing,
  ListingRequest,
  TableFetchParams,
  TableFetchResult,
} from "~/types/listing";

import { DATE_OPERATORS, MATCH_OPERATORS, TEXT_OPERATORS } from "@bbf/schema";
import { keys, within } from "objectively";

/** Every operator's suffix, whatever the kind of column it filters. */
const SUFFIXES = { ...TEXT_OPERATORS, ...DATE_OPERATORS, ...MATCH_OPERATORS };

const OPERATORS = keys(SUFFIXES);

/**
 * The query key of a committed filter: the column's key, and for an
 * operator filter the operator's suffix after it, as the schema spells it:
 * `updatedAtBefore`, `nameStartsWith`. A table offers only the schema's
 * operators, so one it does not name is a fault in the table's config.
 */
const keyOf = ({ key, op }: TableFetchParams["filters"][number]): string => {
  if (op === undefined) return key;
  if (!within(OPERATORS, op)) {
    throw new Error(`"${op}" is not an operator the schema names.`);
  }
  return `${key}${SUFFIXES[op]}`;
};

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
