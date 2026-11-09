import type { StaffRecord } from "@bbf/schema/types";

import type { RecordLink, TableConfig } from "~/types/listing";

import { STAFF_ROLES } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { dated, matching, optional, textual } from "~/constants/listing";

/** The way to a member's profile: the page a row's name leads to. */
export const link: RecordLink<StaffRecord> = (record) =>
  `/staff/${record.id}/profile`;

/**
 * The staff as the admin lists them: every column of a member's record a
 * cell can show, the bio aside. The name, the way to the member's editor,
 * the role and the contact details are shown at first; the summary, the
 * photo and the day added wait in the column manager. A column the API
 * sorts by is sortable. The free text searches the name, the email, the
 * phone, the summary and the bio; beside it, each text column filters on
 * the text it holds, carries, starts or ends with, an optional one on
 * whether it is filled in too, the role on a value held or not, and the
 * days on before, after or on, or on or after or on or before. The
 * search's text literal is the factory's own, named by the prose; every
 * cell formats in the church's time zone.
 */
export const STAFF_TABLE: TableConfig<StaffRecord> = {
  rowKey: "id",
  timeZone: TIME_ZONE,
  searchable: true,
  pinnedColumns: ["name"],
  defaultColumnOrder: ["name", "role", "email", "phone", "updatedAt"],
  columns: [
    {
      key: "name",
      label: "admin.member.name",
      icon: "user",
      link,
      ...textual,
      sortable: true,
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
      key: "email",
      label: "admin.member.email",
      icon: "mail",
      sortable: true,
      ...optional,
    },
    {
      key: "phone",
      label: "admin.member.phone",
      icon: "phone",
      sortable: true,
      ...optional,
    },
    {
      key: "summary",
      label: "admin.editor.summary",
      icon: "text",
      ...optional,
    },
    {
      key: "photo",
      label: "admin.member.photo",
      icon: "image",
      type: "url",
      ...optional,
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
