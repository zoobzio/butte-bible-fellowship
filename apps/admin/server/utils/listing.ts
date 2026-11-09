import type { ListingQuery } from "@bbf/schema/types";

import type {
  DayFilters,
  DaySearch,
  Listing,
  Param,
  TextFilters,
  TextSearch,
  Window,
} from "~~/server/types/listing";

import { DATE_OPERATORS, TEXT_OPERATORS } from "@bbf/schema";
import { collect, entries, keys } from "objectively";

/**
 * The name a list query's SQL gives an operator's parameter, after the
 * column: its words joined by underscores. `name_not_contains` is the name
 * column's `not contains`.
 */
export const param = <S extends string>(operator: S): Param<S> =>
  operator.replaceAll(" ", "_") as Param<S>;

/**
 * The filters on each text column as a list query's SQL takes them,
 * `name_contains` from `nameContains` and the like, each operator's suffix
 * the schema's: null for each left out.
 */
export const toTextSearch = <C extends string>(
  columns: readonly C[],
  query: TextFilters<C>,
): TextSearch<C> =>
  collect(
    columns.flatMap((column) =>
      keys(TEXT_OPERATORS).map((operator) => [column, operator] as const),
    ),
    ([column, operator]) =>
      [
        `${column}_${param(operator)}`,
        query[`${column}${TEXT_OPERATORS[operator]}`] ?? null,
      ] as const,
  );

/**
 * The filters on each day column as a list query's SQL takes them,
 * `updated_before` from `updatedAtBefore` and the like, each operator's
 * suffix the schema's: null for each left out. `columns` names each column
 * as the SQL does, by the key the list query gives it.
 */
export const toDaySearch = <C extends string, K extends string>(
  columns: Record<C, K>,
  query: DayFilters<K>,
): DaySearch<C> =>
  collect(
    entries(columns).flatMap(([column, key]) =>
      keys(DATE_OPERATORS).map((operator) => [column, key, operator] as const),
    ),
    ([column, key, operator]) =>
      [
        `${column}_${param(operator)}`,
        query[`${key}${DATE_OPERATORS[operator]}`] ?? null,
      ] as const,
  );

/**
 * One page of a search, and how many rows the whole search holds, which
 * every row of the page carries. `read` asks the database for a window of
 * the search. A page past the end carries no row to read the count from,
 * so the first row of the search is asked for it then, and nothing found
 * means nothing held.
 */
export const toListing = async <R, T>(
  query: ListingQuery,
  read: (window: Window) => Promise<(R & { total: number })[]>,
  item: (row: R) => T,
): Promise<Listing<T>> => {
  const rows = await read({
    size: query.size,
    offset: (query.page - 1) * query.size,
  });
  const total =
    rows[0]?.total ??
    (query.page === 1
      ? 0
      : ((await read({ size: 1, offset: 0 }))[0]?.total ?? 0));
  return { items: rows.map(item), total };
};
