import type { ListingQuery } from "@bbf/schema/types";

import type { Listing, Param } from "~~/server/types/listing";

export const paginate = <T>(
  items: T[],
  { page, size }: ListingQuery,
): Listing<T> => ({
  items: items.slice((page - 1) * size, page * size),
  total: items.length,
});

/**
 * The name a list query's SQL gives an operator's parameter, after the
 * column: its words joined by underscores. `name_not_contains` is the name
 * column's `not contains`.
 */
export const param = <S extends string>(operator: S): Param<S> =>
  operator.replaceAll(" ", "_") as Param<S>;
