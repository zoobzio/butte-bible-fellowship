import type { StaffRecord } from "@bbf/schema/types";

import type { TableConfig } from "~/types/listing";

import { CONTENT_STATUSES, PRESENCES, STAFF_ROLES } from "@bbf/schema";

import {
  DATE_DEFAULT_OPERATOR,
  DATE_OPERATORS,
  MATCH_DEFAULT_OPERATOR,
  MATCH_OPERATORS,
} from "~/constants/listing";

/** A filter on a column with a set of values: the value held, or one not. */
const matching = {
  operators: MATCH_OPERATORS,
  defaultOperator: MATCH_DEFAULT_OPERATOR,
};

/** A filter on a day: before, after or on it. The days come at runtime. */
const dated = {
  operators: DATE_OPERATORS,
  defaultOperator: DATE_DEFAULT_OPERATOR,
};

/** A filter on an optional column: whether it is filled in. */
const filled = { values: [...PRESENCES] };

/**
 * The staff as the admin lists them: every column of a member's record a
 * cell can show, the bio aside. The name, the role, the status and the
 * contact details are shown at first; the summary, the photo and the day
 * added wait in the column manager. A column the API sorts by is
 * sortable. The free text searches the name, the email, the phone and the
 * summary, so the name offers no filter of its own; each optional column
 * filters on whether it is filled in, the role and the status on a value
 * held or not, and the days on before, after or on.
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
      values: [...STAFF_ROLES],
      ...matching,
      sortable: true,
    },
    {
      key: "status",
      label: "admin.editor.status",
      icon: "badge",
      type: "enum",
      values: [...CONTENT_STATUSES],
      ...matching,
      sortable: true,
    },
    {
      key: "email",
      label: "admin.member.email",
      icon: "mail",
      sortable: true,
      ...filled,
    },
    {
      key: "phone",
      label: "admin.member.phone",
      icon: "phone",
      sortable: true,
      ...filled,
    },
    {
      key: "summary",
      label: "admin.editor.summary",
      icon: "text",
      ...filled,
    },
    {
      key: "photo",
      label: "admin.member.photo",
      icon: "image",
      type: "url",
      ...filled,
    },
    {
      key: "updatedAt",
      label: "admin.editor.updated",
      icon: "calendar-clock",
      type: "datetime",
      ...dated,
      sortable: true,
    },
    {
      key: "createdAt",
      label: "admin.editor.created",
      icon: "calendar",
      type: "datetime",
      ...dated,
      sortable: true,
    },
  ],
};
