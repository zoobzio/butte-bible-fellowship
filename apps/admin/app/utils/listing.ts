import type { AppProsaryMessage } from "#imports";

import type {
  Listing,
  ListingRequest,
  TableConfig,
  TableDescriptors,
  TableFetchParams,
  TableFetchResult,
} from "~/types/listing";

import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

const DAY = 86_400_000;

/**
 * The last `count` days, today first, each as YYYY-MM-DD: the day it is in
 * the church's time zone, as the API reads a day.
 */
export const recentDays = (count: number, now = new Date()): string[] => {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    dateStyle: "short",
  }).format(now);
  const [year, month, day] = today.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const start = Date.UTC(year, month - 1, day);
  return Array.from({ length: count }, (_, i) =>
    new Date(start - i * DAY).toISOString().slice(0, 10),
  );
};

/**
 * The config with `days` as the values each date column's filter offers,
 * for the search to list, narrow and complete. The operators are the
 * column's own.
 */
export const withDays = <T>(
  config: TableConfig<T>,
  days: string[],
): TableConfig<T> => ({
  ...config,
  columns: config.columns.map((column) =>
    column.type === "date" || column.type === "datetime"
      ? { ...column, values: days }
      : column,
  ),
});

export const toTableDescriptors = <T>(
  config: TableConfig<T>,
  name: (message: AppProsaryMessage) => string,
): TableDescriptors<T> => ({
  ...config,
  timeZone: TIME_ZONE,
  columns: config.columns.map((column) => ({
    ...column,
    label: name(column.label),
  })),
});

/**
 * The query key of a committed filter: the column's key, and for an
 * operator filter the operator capitalised after it: `updatedAtBefore`.
 */
const keyOf = ({ key, op }: TableFetchParams["filters"][number]): string =>
  op === undefined ? key : `${key}${op.charAt(0).toUpperCase()}${op.slice(1)}`;

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
