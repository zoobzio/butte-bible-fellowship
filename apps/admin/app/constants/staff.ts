import type { StaffRecord } from "@bbf/schema/types";

import type { TableConfig } from "~/types/listing";

import { CONTENT_STATUSES, STAFF_ROLES } from "@bbf/schema";

/**
 * The staff as the admin lists them: every column of a member's record a
 * cell can show, the bio aside. The name, the role, the status and the
 * contact details are shown at first; the summary, the photo and the day
 * added wait in the column manager. A column the API sorts by is
 * sortable; the free text searches the name alone, so no text column
 * offers a filter of its own.
 */
export const STAFF_TABLE: TableConfig<StaffRecord> = {
  rowKey: "id",
  searchable: true,
  pinnedColumns: ["name"],
  defaultColumnOrder: ["name", "role", "status", "email", "phone", "updatedAt"],
  columns: [
    {
      key: "name",
      label: "admin.member.name",
      icon: "user",
      sortable: true,
      filterable: false,
    },
    {
      key: "role",
      label: "admin.member.role",
      icon: "briefcase",
      type: "enum",
      enumValues: [...STAFF_ROLES],
      sortable: true,
    },
    {
      key: "status",
      label: "admin.editor.status",
      icon: "badge",
      type: "enum",
      enumValues: [...CONTENT_STATUSES],
      sortable: true,
    },
    {
      key: "email",
      label: "admin.member.email",
      icon: "mail",
      sortable: true,
      filterable: false,
    },
    {
      key: "phone",
      label: "admin.member.phone",
      icon: "phone",
      sortable: true,
      filterable: false,
    },
    {
      key: "summary",
      label: "admin.editor.summary",
      icon: "text",
      filterable: false,
    },
    {
      key: "photo",
      label: "admin.member.photo",
      icon: "image",
      type: "url",
      filterable: false,
    },
    {
      key: "updatedAt",
      label: "admin.editor.updated",
      icon: "calendar-clock",
      type: "datetime",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "admin.editor.created",
      icon: "calendar",
      type: "datetime",
      sortable: true,
    },
  ],
};
