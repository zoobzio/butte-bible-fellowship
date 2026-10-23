import type { StaffRecord } from "@bbf/schema/types";

import type { TableConfig } from "~/types/listing";

import { CONTENT_STATUSES } from "@bbf/schema";

/**
 * The staff table: a member to a row, in the order the site lists them, the
 * name pinned as the way to the editor. The search is left off: the list is
 * short, and the queries do not filter.
 */
export const STAFF_TABLE: TableConfig<StaffRecord> = {
  rowKey: "id",
  searchable: false,
  pinnedColumns: ["name"],
  columns: [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "position", label: "Position", type: "number", align: "right" },
    {
      key: "status",
      label: "Status",
      type: "enum",
      enumValues: [...CONTENT_STATUSES],
    },
    { key: "updatedAt", label: "Updated", type: "datetime" },
  ],
};
