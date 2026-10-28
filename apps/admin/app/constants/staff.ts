import type { StaffRecord } from "@bbf/schema/types";

import type { TableConfig } from "~/types/listing";

import { CONTENT_STATUSES } from "@bbf/schema";

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
