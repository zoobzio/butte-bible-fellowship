import type { StaffRecord, StaffView } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { RecordLink, TableConfig } from "~/types/listing";

import { STAFF_ROLES, staffView } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import {
  PAGE_SIZE,
  dated,
  matching,
  optional,
  textual,
} from "~/constants/listing";

/** The way to a member's profile: the page a row's name leads to. */
export const link: RecordLink<StaffRecord> = (record) =>
  `/staff/${record.id}/profile`;

/**
 * The staff as the admin lists them: every column of a member's record a
 * cell can show, the bio aside. The name, the way to the member's editor,
 * the role and the contact details are shown at first; the summary, the
 * photo and the day added wait in the column manager, and the name is
 * never hidden. A column sorts unless the API does not sort by it, and by
 * one column at a time, as the API does. The free text searches the name,
 * the email, the phone, the summary and the bio; beside it, each text column filters on
 * the text it holds, carries, starts or ends with, an optional one on
 * whether it is filled in too, the role on a value held or not, and the
 * days on before, after or on, or on or after or on or before. The
 * search's text literal is the factory's own, named by the prose; every
 * cell formats in the church's time zone.
 */
export const STAFF_TABLE: TableConfig<StaffRecord> = {
  getRowId: (record) => String(record.id),
  timeZone: TIME_ZONE,
  permissions: { multiSort: false },
  initialState: {
    pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    columnVisibility: {
      summary: false,
      photo: false,
      createdAt: false,
    },
  },
  columns: [
    {
      accessorKey: "name",
      size: 240,
      enableHiding: false,
      meta: {
        label: "admin.member.name",
        icon: "user",
        link,
        ...textual,
      },
    },
    {
      accessorKey: "role",
      meta: {
        label: "admin.member.role",
        icon: "briefcase",
        type: "enum",
        values: [...STAFF_ROLES],
        ...matching,
      },
    },
    {
      accessorKey: "email",
      size: 220,
      meta: {
        label: "admin.member.email",
        icon: "mail",
        ...optional,
      },
    },
    {
      accessorKey: "phone",
      meta: {
        label: "admin.member.phone",
        icon: "phone",
        ...optional,
      },
    },
    {
      accessorKey: "summary",
      enableSorting: false,
      meta: {
        label: "admin.editor.summary",
        icon: "text",
        ...optional,
      },
    },
    {
      accessorKey: "photo",
      enableSorting: false,
      meta: {
        label: "admin.member.photo",
        icon: "image",
        type: "url",
        ...optional,
      },
    },
    {
      accessorKey: "updatedAt",
      size: 200,
      meta: {
        label: "admin.editor.updated",
        icon: "calendar-clock",
        type: "datetime",
        ...dated,
      },
    },
    {
      accessorKey: "createdAt",
      size: 200,
      meta: {
        label: "admin.editor.created",
        icon: "calendar",
        type: "datetime",
        ...dated,
      },
    },
  ],
};

/**
 * The views of the staff the admin itself has, before any a user saves:
 * the table as it starts, which is what its tab goes back to. Its payload
 * is read from the table's own config, so the two never part, and the view
 * is not marked as edited until the table is. Its name is a message of the
 * prose, which the tabs resolve.
 */
export const STAFF_VIEWS: {
  id: string;
  name: Extract<AppProsaryMessage, string>;
  payload: StaffView;
}[] = [
  {
    id: "all",
    name: "admin.staff.allView",
    payload: staffView.parse({
      pageSize: STAFF_TABLE.initialState?.pagination?.pageSize,
      columnVisibility: STAFF_TABLE.initialState?.columnVisibility,
    }),
  },
];
