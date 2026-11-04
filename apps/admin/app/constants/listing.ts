/*
 * The operators a column's filter carries, by the kind of column, as the
 * search's grammar reads them: `Label: operator value`, the operator a
 * word or a few, and the value one term. The API names a filter by its
 * column and its operator, `updatedAtOnOrAfter`, so an operator added here
 * is one the API must take.
 */

/**
 * The operators a text column carries: the text it holds or does not,
 * whatever the case, and the text it carries, does not carry, starts with
 * or ends with, as typed. Contains is the one a bare value takes. An
 * optional column offers `PRESENCES` of the schema as its values: under
 * is and not, whether it is filled in, and under the other operators text
 * like any, as the search offers a column's values under every operator
 * alike.
 */
export const TEXT_OPERATORS = [
  "contains",
  "not contains",
  "starts with",
  "ends with",
  "is",
  "not",
] as const;

export const TEXT_DEFAULT_OPERATOR = "contains";

/**
 * The operators a number column carries: the number held or not, and over
 * or under, at least or at most one. Is is the one a bare number takes.
 * No column of the staff is a number yet; the vocabulary stands for the
 * tables that follow.
 */
export const NUMBER_OPERATORS = [
  "is",
  "not",
  "over",
  "under",
  "at least",
  "at most",
] as const;

export const NUMBER_DEFAULT_OPERATOR = "is";

/**
 * The operators a date column's filter carries: a day the records were
 * changed or added before, after, on, on or after, or on or before. On is
 * the one a bare day takes. A span of days is two filters on the column,
 * one each way: on or after the first and on or before the last.
 */
export const DATE_OPERATORS = [
  "before",
  "after",
  "on",
  "on or after",
  "on or before",
] as const;

export const DATE_DEFAULT_OPERATOR = "on";

/**
 * The operators a column with a set of values carries: the value the
 * records hold, or one they do not. Is is the one a bare value takes.
 */
export const MATCH_OPERATORS = ["is", "not"] as const;

export const MATCH_DEFAULT_OPERATOR = "is";
