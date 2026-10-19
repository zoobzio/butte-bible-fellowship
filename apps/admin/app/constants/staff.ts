import type { StaffRecord } from "@bbf/schema/types";

import { CONTENT_STATUSES } from "@bbf/schema";
import { defineEntity } from "@zoobzio/foundation/definitions/entity";

/**
 * The staff table: a member to a row, in the order the site lists them, the
 * name pinned as the way to the editor. The search is left off: the list is
 * short, and the queries do not filter.
 */
export const STAFF_TABLE = defineEntity<StaffRecord>().defineTable({
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
  actions: {
    edit: { label: "Edit" },
  },
});
