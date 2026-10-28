import type { ListingQuery } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type {
  Listing,
  TableConfig,
  TableDescriptors,
  TableFetchParams,
  TableFetchResult,
} from "~/types/listing";

import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

export const toTableDescriptors = <T>(
  config: TableConfig<T>,
  name: (message: AppProsaryMessage) => string,
): TableDescriptors<T> => ({
  ...config,
  timeZone: TIME_ZONE,
  columns: config.columns.map((column) => ({
    ...column,
    label: name(column.label),
  })),
});

export const toListingQuery = ({
  page,
  pageSize,
}: TableFetchParams): ListingQuery => ({ page, size: pageSize });

export const toFetchResult = <T>(
  listing: Listing<T>,
  size: number,
): TableFetchResult<T> => ({
  data: listing.items,
  total: listing.total,
  pageCount: Math.max(1, Math.ceil(listing.total / size)),
});
