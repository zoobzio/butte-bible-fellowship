/*
 * The operators a listing's column filters carry, by the kind of column:
 * each word as the admin's search offers it, and the suffix a query key
 * carries for it after the column's key, `nameNotContains`. One row per
 * operator is the whole vocabulary; the column generators of the listing
 * read it, so a row added is a filter every column of its kind takes.
 */

/**
 * The operators a text column carries: the text it holds or does not,
 * whatever the case, and the text it carries, does not carry, starts with
 * or ends with, as typed. Contains is the one a bare value takes.
 */
export const TEXT_OPERATORS = {
  contains: "Contains",
  "not contains": "NotContains",
  "starts with": "StartsWith",
  "ends with": "EndsWith",
  is: "Is",
  not: "Not",
} as const;

export const TEXT_DEFAULT_OPERATOR =
  "contains" satisfies keyof typeof TEXT_OPERATORS;

/**
 * The operators a day column carries: a day the records were changed or
 * added before, after, on, on or after, or on or before. On is the one a
 * bare day takes. A span of days is two filters on the column, one each
 * way: on or after the first and on or before the last.
 */
export const DATE_OPERATORS = {
  before: "Before",
  after: "After",
  on: "On",
  "on or after": "OnOrAfter",
  "on or before": "OnOrBefore",
} as const;

export const DATE_DEFAULT_OPERATOR = "on" satisfies keyof typeof DATE_OPERATORS;

/**
 * The operators a column with a set of values carries: the value the
 * records hold, or one they do not. Is is the one a bare value takes.
 */
export const MATCH_OPERATORS = {
  is: "Is",
  not: "Not",
} as const;

export const MATCH_DEFAULT_OPERATOR =
  "is" satisfies keyof typeof MATCH_OPERATORS;
