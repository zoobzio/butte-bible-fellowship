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

/**
 * A column as the app configures it: its label a message of the prose,
 * never a bare string, which the layer's factory resolves as the table is
 * built. The icon the heading, the search's field option and the column
 * manager's item lead with is the layer's own field.
 */
export type TableColumn<T> = Omit<
  TableOptions<T>["columns"][number],
  "label"
> & {
  label: AppProsaryMessage;
};

/**
 * A table as the app configures it: the descriptors alone. The fetch, the
 * actions and the initial state are wired where the table is created.
 */
export type TableConfig<T> = Omit<
  TableOptions<T>,
  "columns" | "fetch" | "actions" | "bulkActions" | "initial"
> & {
  columns: TableColumn<T>[];
};

export type TableFetch<T> = TableOptions<T>["fetch"];

export type TableFetchParams = Parameters<TableFetch<unknown>>[0];

export type TableFetchResult<T> = Awaited<ReturnType<TableFetch<T>>>;

export type TableService<T> = ReturnType<UseTable<T>>;
