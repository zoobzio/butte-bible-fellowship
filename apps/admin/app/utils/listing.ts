import type {
  Listing,
  ListingRequest,
  TableFetchParams,
  TableFetchResult,
  TableRecord,
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
 * What a table asks the API for: the page, counted from one as the API
 * counts it, the free text as `q`, one column filter per key, and the sort
 * as `sort` and `direction` once a column is sorted. The API sorts by one
 * column, so the first of the table's sorts is the one asked for; unsorted,
 * the API lists in its own order.
 */
export const toListingQuery = ({
  pagination,
  sorting,
  query,
  filters,
}: TableFetchParams): ListingRequest => {
  const [sort] = sorting;
  return {
    ...Object.fromEntries(
      filters.map((filter) => [keyOf(filter), filter.value]),
    ),
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
    ...(query === "" ? {} : { q: query }),
    ...(sort === undefined
      ? {}
      : { sort: sort.id, direction: sort.desc ? "desc" : "asc" }),
  };
};

/**
 * A page of a listing as the table takes it: its rows, and how many the
 * whole search holds, which the table counts its pages from.
 */
export const toFetchResult = <T extends TableRecord>(
  listing: Listing<T>,
): TableFetchResult<T> => ({
  data: listing.items,
  rowCount: listing.total,
});
