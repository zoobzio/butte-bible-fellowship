import type { listing } from "@bbf/schema";
import type { z } from "zod";

/**
 * A page of a list, as the admin's APIs answer with one: the items the page
 * holds, and how many there are in all. The shape `@bbf/schema`'s `listing`
 * gives every kind, over any kind.
 */
export type Listing<T> = z.infer<ReturnType<typeof listing<z.ZodType<T>>>>;

/** The way to a record's editor, from the record. */
export type RecordLink<T> = (record: T) => string;
