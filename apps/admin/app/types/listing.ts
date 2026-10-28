import type { listing } from "@bbf/schema";
import type { AppProsaryMessage, TableOptions, UseTable } from "#imports";
import type { z } from "zod";

/**
 * A page of a list, as the admin's APIs answer with one: the items the page
 * holds, and how many there are in all. The shape `@bbf/schema`'s `listing`
 * gives every kind, over any kind.
 */
export type Listing<T> = z.infer<ReturnType<typeof listing<z.ZodType<T>>>>;

/** The way to a record's editor, from the record. */
export type RecordLink<T> = (record: T) => string;

/**
 * What a table of records is, apart from how it fetches and what its
 * actions do: its columns, its key, and how it shows them, as the design
 * system's factory takes them.
 */
export type TableDescriptors<T> = Omit<
  TableOptions<T>,
  "fetch" | "actions" | "bulkActions" | "initial"
>;

/** A column as the admin configures it: headed by a message of `@bbf/prose`, by key. */
export type TableColumn<T> = Omit<
  TableDescriptors<T>["columns"][number],
  "label"
> & {
  label: AppProsaryMessage;
};

/**
 * A table as the admin configures it: the descriptors, each column headed
 * by a message rather than its words, resolved in the reader's language as
 * the table is built.
 */
export type TableConfig<T> = Omit<TableDescriptors<T>, "columns"> & {
  columns: TableColumn<T>[];
};

/** The fetch a table runs, as the design system's layer takes it. */
export type TableFetch<T> = TableOptions<T>["fetch"];

/** What a table asks its fetch for: the page, its size, sort and search. */
export type TableFetchParams = Parameters<TableFetch<unknown>>[0];

/** What a table's fetch answers with: the rows, the total and the page count. */
export type TableFetchResult<T> = Awaited<ReturnType<TableFetch<T>>>;

/** A table's service, as the design system's layer builds one. */
export type TableService<T> = ReturnType<UseTable<T>>;
