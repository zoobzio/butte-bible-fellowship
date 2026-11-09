import type { DATE_OPERATORS, TEXT_OPERATORS, listing } from "@bbf/schema";
import type { DateOperator, TextOperator } from "@bbf/schema/types";
import type { z } from "zod";

export type Listing<T> = z.infer<ReturnType<typeof listing<z.ZodType<T>>>>;

/**
 * An operator's words joined by underscores, as a list query's SQL names
 * the parameter after the column: `not contains` is `not_contains`.
 */
export type Param<S extends string> = S extends `${infer Head} ${infer Rest}`
  ? `${Head}_${Param<Rest>}`
  : S;

/**
 * The text filters a list query may carry on the columns `C`, each under
 * the column's key and the operator's suffix, as the schema spells them:
 * `nameContains`.
 */
export type TextFilters<C extends string> = Partial<
  Record<`${C}${(typeof TEXT_OPERATORS)[TextOperator]}`, string>
>;

/**
 * The text filters on the columns `C` as a list query's SQL takes them,
 * `name_contains` and the like: null for each left out.
 */
export type TextSearch<C extends string> = Record<
  `${C}_${Param<TextOperator>}`,
  string | null
>;

/**
 * The day filters a list query may carry on the keys `K`, each under the
 * key and the operator's suffix, as the schema spells them:
 * `updatedAtBefore`.
 */
export type DayFilters<K extends string> = Partial<
  Record<`${K}${(typeof DATE_OPERATORS)[DateOperator]}`, string>
>;

/**
 * The day filters on the columns `C` as a list query's SQL takes them,
 * `updated_before` and the like: null for each left out.
 */
export type DaySearch<C extends string> = Record<
  `${C}_${Param<DateOperator>}`,
  string | null
>;

/** The rows of a list query a page is cut to: how many, from where. */
export interface Window {
  size: number;
  offset: number;
}
