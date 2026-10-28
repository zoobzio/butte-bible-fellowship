import type { listing } from "@bbf/schema";
import type { AppProsaryMessage, TableOptions, UseTable } from "#imports";
import type { z } from "zod";

export type Listing<T> = z.infer<ReturnType<typeof listing<z.ZodType<T>>>>;

export type RecordLink<T> = (record: T) => string;

export type TableDescriptors<T> = Omit<
  TableOptions<T>,
  "fetch" | "actions" | "bulkActions" | "initial"
>;

export type TableColumn<T> = Omit<
  TableDescriptors<T>["columns"][number],
  "label"
> & {
  label: AppProsaryMessage;
};

export type TableConfig<T> = Omit<TableDescriptors<T>, "columns"> & {
  columns: TableColumn<T>[];
};

export type TableFetch<T> = TableOptions<T>["fetch"];

export type TableFetchParams = Parameters<TableFetch<unknown>>[0];

export type TableFetchResult<T> = Awaited<ReturnType<TableFetch<T>>>;

export type TableService<T> = ReturnType<UseTable<T>>;
