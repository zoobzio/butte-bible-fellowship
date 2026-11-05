import type { listing } from "@bbf/schema";
import type { z } from "zod";

export type Listing<T> = z.infer<ReturnType<typeof listing<z.ZodType<T>>>>;

/**
 * An operator's words joined by underscores, as a list query's SQL names
 * the parameter after the column: `not contains` is `not_contains`.
 */
export type Param<S extends string> = S extends `${infer Head} ${infer Rest}`
  ? `${Head}_${Param<Rest>}`
  : S;
