import type { StaffRecord } from "@bbf/schema/types";

import type { TableConfig } from "~/types/listing";

import { CONTENT_STATUSES } from "@bbf/schema";

/**
 * The staff table: a member to a row, in the order the site lists them, the
 * name pinned as the way to the editor. The search is left off: the list is
 * short, and the queries do not filter. Each column is headed by a message
 * of `@bbf/prose`, by key.
 */
export const STAFF_TABLE: TableConfig<StaffRecord> = {
  rowKey: "id",
  searchable: false,
  pinnedColumns: ["name"],
  columns: [
    { key: "name", label: "admin.member.name" },
    { key: "role", label: "admin.member.role" },
    {
      key: "position",
      label: "admin.member.position",
      type: "number",
      align: "right",
    },
    {
      key: "status",
      label: "admin.editor.status",
      type: "enum",
      enumValues: [...CONTENT_STATUSES],
    },
    { key: "updatedAt", label: "admin.editor.updated", type: "datetime" },
  ],
};
