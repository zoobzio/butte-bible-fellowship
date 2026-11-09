import {
  DATE_DEFAULT_OPERATOR,
  DATE_OPERATORS,
  MATCH_DEFAULT_OPERATOR,
  MATCH_OPERATORS,
  PRESENCES,
  TEXT_DEFAULT_OPERATOR,
  TEXT_OPERATORS,
} from "@bbf/schema";
import { keys } from "objectively";

/*
 * The filters a table's column takes, by the kind of column: the operators
 * the search offers on it, and the one a bare value takes. Each is spread
 * into the column it filters.
 */

/** A filter on a column with a set of values: the value held, or one not. */
export const matching = {
  operators: keys(MATCH_OPERATORS),
  defaultOperator: MATCH_DEFAULT_OPERATOR,
};

/**
 * A filter on a text column: the text held or not, carried or not, or
 * started or ended with.
 */
export const textual = {
  operators: keys(TEXT_OPERATORS),
  defaultOperator: TEXT_DEFAULT_OPERATOR,
};

/**
 * A filter on an optional text column: the text filters, and under is and
 * not, whether the column is filled in, which the search offers.
 */
export const optional = { ...textual, values: [...PRESENCES] };

/**
 * A filter on a day: before, after, on, on or after, or on or before it.
 * The days the search offers are the table's own, generated from the term
 * typed.
 */
export const dated = {
  operators: keys(DATE_OPERATORS),
  defaultOperator: DATE_DEFAULT_OPERATOR,
};
