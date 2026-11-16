import type { listing } from "@bbf/schema";
import type { ListingQuery } from "@bbf/schema/types";
import type { AppProsaryMessage, TableOptions, UseTable } from "#imports";
import type { z } from "zod";

export type Listing<T> = z.infer<ReturnType<typeof listing<z.ZodType<T>>>>;

export type RecordLink<T> = (record: T) => string;

/**
 * What a table asks the API for: the page, the free text as `q`, and one
 * column filter per key, each as the value the table committed.
 */
export type ListingRequest = ListingQuery & Record<string, string | number>;

/** A record a table lists: what each of its rows is read from. */
export type TableRecord = Record<string, unknown>;

type ColumnDefinition<T extends TableRecord> =
  TableOptions<T>["columns"][number];

/** What a column says of itself beyond its definition, for the table to read. */
type ColumnMeta<T extends TableRecord> = NonNullable<
  ColumnDefinition<T>["meta"]
>;

/**
 * A column as the app configures it: a column of the table over one key of
 * the record, which is its id, the key the API sorts and filters it by.
 * What the table and its search read of it sits on its `meta`: its label a
 * message of the prose, never a bare string, which the layer's factory
 * resolves as the table is built, and the icon the heading, the search's
 * field option and the column manager's item lead with, the layer's own
 * field.
 */
export type TableColumn<T extends TableRecord> = Omit<
  Extract<ColumnDefinition<T>, { accessorKey: unknown }>,
  "accessorKey" | "meta"
> & {
  accessorKey: keyof T & string;
  meta: Omit<ColumnMeta<T>, "label"> & { label: AppProsaryMessage };
};

/**
 * A table as the app configures it: the descriptors alone. The fetch and
 * the actions are wired where the table is created.
 */
export type TableConfig<T extends TableRecord> = Omit<
  TableOptions<T>,
  "columns" | "fetch" | "actions" | "bulkActions"
> & {
  columns: TableColumn<T>[];
};

export type TableFetch<T extends TableRecord> = TableOptions<T>["fetch"];

export type TableFetchParams = Parameters<TableFetch<TableRecord>>[0];

export type TableFetchResult<T extends TableRecord> = Awaited<
  ReturnType<TableFetch<T>>
>;

export type TableService<T extends TableRecord> = ReturnType<UseTable<T>>;
