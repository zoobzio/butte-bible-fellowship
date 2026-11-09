import { rekey } from "objectively";
import { z } from "zod";

import { DATE_OPERATORS, MATCH_OPERATORS, TEXT_OPERATORS } from "./operators";

export const LISTING_MAX_SIZE = 100;

export const LISTING_DEFAULT_SIZE = 25;

export const SORT_DIRECTIONS = ["asc", "desc"] as const;

export const sortDirection = z.enum(SORT_DIRECTIONS).meta({
  description: "Which way a listing is sorted: ascending or descending.",
});

/**
 * The sort a listing takes, over the columns `field` names: the column,
 * and the direction. Left out, the listing is in its own order, and a
 * column named without a direction is ascending.
 */
export const sorting = <T extends z.ZodType<string>>(field: T) => ({
  sort: field.optional().meta({
    description:
      "The column the items are sorted by. Left out, the items are in their own order.",
  }),
  direction: sortDirection.optional().meta({
    description: "Which way the items are sorted. Left out, ascending.",
    examples: ["asc"],
  }),
});

/**
 * The words a text column's `is` and `not` filters take for whether the
 * column is filled in, beside any text it holds: a listing narrows to the
 * records that have it, or to the ones that lack it.
 */
export const PRESENCES = ["present", "missing"] as const;

const text = (what: string) =>
  z
    .string()
    .min(1)
    .optional()
    .meta({
      description: `${what}, as typed, without regard to case. Left out, any.`,
    });

const day = (what: string) =>
  z.iso
    .date()
    .optional()
    .meta({
      description: `${what}, as YYYY-MM-DD, in the church's own time. Left out, any day.`,
      examples: ["2026-10-17"],
    });

type TextOperator = keyof typeof TEXT_OPERATORS;

type DateOperator = keyof typeof DATE_OPERATORS;

type MatchOperator = keyof typeof MATCH_OPERATORS;

type TextFilter = ReturnType<typeof text>;

type DayFilter = ReturnType<typeof day>;

/**
 * The filter each text operator takes, over what the column holds: the
 * value it holds or not, whatever the case, or `present` or `missing` for
 * whether it is filled in; and the text it carries, does not carry, starts
 * with or ends with, as typed. One per operator, which the type holds the
 * record to.
 */
const TEXT_FILTERS: Record<TextOperator, (what: string) => TextFilter> = {
  is: (what) =>
    z
      .string()
      .min(1)
      .optional()
      .meta({
        description: `The ${what} the items listed hold, without regard to case, or present or missing for whether they have one. Left out, any.`,
        examples: ["missing"],
      }),
  not: (what) =>
    z
      .string()
      .min(1)
      .optional()
      .meta({
        description: `A ${what} the items listed do not hold, without regard to case, or present or missing for whether they lack one. Left out, none.`,
        examples: ["present"],
      }),
  contains: (what) => text(`Text the ${what} must carry`),
  "not contains": (what) => text(`Text the ${what} must not carry`),
  "starts with": (what) => text(`Text the ${what} must start with`),
  "ends with": (what) => text(`Text the ${what} must end with`),
};

/**
 * The filter each day operator takes, over the day the column names: the
 * day before, after, on, on or after, or on or before it.
 */
const DAY_FILTERS: Record<DateOperator, (what: string) => DayFilter> = {
  before: (what) => day(`${what} before`),
  after: (what) => day(`${what} after`),
  on: (what) => day(`${what} on`),
  "on or after": (what) => day(`${what} on or after`),
  "on or before": (what) => day(`${what} on or before`),
};

/** The filters on a text column, under its key and each operator's suffix. */
type TextColumn<K extends string> = Record<
  `${K}${(typeof TEXT_OPERATORS)[TextOperator]}`,
  TextFilter
>;

/** The filters on a day column, under its key and each operator's suffix. */
type DayColumn<K extends string> = Record<
  `${K}${(typeof DATE_OPERATORS)[DateOperator]}`,
  DayFilter
>;

/**
 * The filters on a text column, one per text operator, each under the
 * column's key and the operator's suffix: `nameContains`, `nameNotContains`,
 * `nameStartsWith`, `nameEndsWith`, `nameIs`, `nameNot`. `what` names the
 * column as the descriptions read it.
 */
export const textColumn = <K extends string>(key: K, what: string) =>
  rekey<typeof TEXT_OPERATORS, TextColumn<K>>(
    TEXT_OPERATORS,
    (operator, suffix) => [`${key}${suffix}`, TEXT_FILTERS[operator](what)],
  );

/**
 * The filters on a day column, one per day operator, each under the
 * column's key and the operator's suffix: `updatedAtBefore`,
 * `updatedAtAfter`, `updatedAtOn`, `updatedAtOnOrAfter`,
 * `updatedAtOnOrBefore`. `what` names the day as the descriptions read it.
 */
export const dayColumn = <K extends string>(key: K, what: string) =>
  rekey<typeof DAY_FILTERS, DayColumn<K>>(DAY_FILTERS, (operator, filter) => [
    `${key}${DATE_OPERATORS[operator]}`,
    filter(what),
  ]);

/**
 * What each match operator's filter says of itself, over the value the
 * column holds: the one the items hold, or one they do not.
 */
const MATCH_FILTERS: Record<MatchOperator, (what: string) => string> = {
  is: (what) => `The ${what} the items listed hold. Left out, any.`,
  not: (what) => `A ${what} the items listed do not hold. Left out, none.`,
};

/** The filters on a column with a set of values, under its key and each operator's suffix. */
type MatchColumn<K extends string, T extends z.ZodType> = Record<
  `${K}${(typeof MATCH_OPERATORS)[MatchOperator]}`,
  z.ZodOptional<T>
>;

/**
 * The filters on a column with a set of values, one per match operator,
 * each under the column's key and the operator's suffix: `statusIs`,
 * `statusNot`. `value` is the schema of the values the column holds, and
 * `what` names the column as the descriptions read it.
 */
export const matchColumn = <K extends string, T extends z.ZodType>(
  key: K,
  value: T,
  what: string,
) =>
  rekey<typeof MATCH_OPERATORS, MatchColumn<K, T>>(
    MATCH_OPERATORS,
    (operator, suffix) => [
      `${key}${suffix}`,
      value.optional().meta({ description: MATCH_FILTERS[operator](what) }),
    ],
  );

export const listingQuery = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .meta({
      description: "Which page, counted from one. Left out, the first.",
      examples: [1],
    }),
  size: z.coerce
    .number()
    .int()
    .min(1)
    .max(LISTING_MAX_SIZE)
    .default(LISTING_DEFAULT_SIZE)
    .meta({
      description: "How many items to a page. Left out, twenty-five.",
      examples: [25],
    }),
  q: z
    .string()
    .trim()
    .optional()
    .meta({
      description:
        "Free text the items are searched for, without regard to case. Left out or empty, every item.",
      examples: ["jane"],
    }),
});
