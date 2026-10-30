/**
 * How many days back a date column's filter offers to pick from: a month,
 * today first. The search renders every option it offers, so the list
 * stays short; an older day is typed in full, and taken as typed.
 */
export const FILTER_DAYS = 31;

/**
 * The operators a date column's filter carries: a day the records were
 * changed or added before, after or on. On is the one a bare day takes.
 */
export const DATE_OPERATORS = ["before", "after", "on"] as const;

export const DATE_DEFAULT_OPERATOR = "on";

/**
 * The operators a column with a set of values carries: the value the
 * records hold, or one they do not. Is is the one a bare value takes.
 */
export const MATCH_OPERATORS = ["is", "not"] as const;

export const MATCH_DEFAULT_OPERATOR = "is";
