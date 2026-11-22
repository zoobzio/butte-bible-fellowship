import type { PersonRecord, PeopleView } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { RecordLink, TableConfig } from "~/types/listing";

import { PERSON_ROLES, peopleView } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import {
  PAGE_SIZE,
  dated,
  matching,
  optional,
  textual,
} from "~/constants/listing";

/** The way to a person's profile: the page a row's name leads to. */
export const link: RecordLink<PersonRecord> = (record) =>
  `/people/${record.id}/profile`;

/**
 * The people as the admin lists them: every column of a person's record a
 * cell can show, the bio aside. The name, the way to the
 * person's editor, the role and the contact details are shown at first;
 * the title, the summary, the address, the birthday, the photo and the day
 * added wait in the column manager, and the name is never hidden. Any
 * column pins to a side of the table from its heading, to hold it while
 * the rest scroll, which a saved view keeps. A column sorts unless the API
 * does not sort by it, and by one column at a time, as the API does; by
 * name is by the last name, then the first. The free text searches the
 * name, the email, the phone, the title, the summary, the address and the
 * bio; beside it, each text column filters on the text it holds, carries,
 * starts or ends with, an optional one on whether it is filled in too, the
 * role on a value held or not, and the days on before, after or on, or on
 * or after or on or before. The search's text literal is the factory's
 * own, named by the prose; every cell formats in the church's time zone.
 */
export const PEOPLE_TABLE: TableConfig<PersonRecord> = {
  getRowId: (record) => String(record.id),
  timeZone: TIME_ZONE,
  permissions: { multiSort: false },
  initialState: {
    pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    columnVisibility: {
      title: false,
      summary: false,
      address: false,
      birthday: false,
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
        label: "admin.person.name",
        icon: "user",
        link,
        ...textual,
      },
    },
    {
      accessorKey: "role",
      meta: {
        label: "admin.person.role",
        icon: "briefcase",
        type: "enum",
        values: [...PERSON_ROLES],
        ...matching,
      },
    },
    {
      accessorKey: "title",
      meta: {
        label: "admin.person.title",
        icon: "badge",
        ...optional,
      },
    },
    {
      accessorKey: "email",
      size: 220,
      meta: {
        label: "admin.person.email",
        icon: "mail",
        ...optional,
      },
    },
    {
      accessorKey: "phone",
      meta: {
        label: "admin.person.phone",
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
      accessorKey: "address",
      enableSorting: false,
      meta: {
        label: "admin.person.address",
        icon: "map-pin",
        ...optional,
      },
    },
    {
      accessorKey: "birthday",
      meta: {
        label: "admin.person.birthday",
        icon: "cake",
        type: "date",
        /* The API sorts by the birthday and does not filter by it. */
        filterable: false,
      },
    },
    {
      accessorKey: "photo",
      enableSorting: false,
      meta: {
        label: "admin.person.photo",
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
 * The views of the people the admin itself has, before any a user saves:
 * the table as it starts, which is what its tab goes back to, and beside
 * it the staff alone, everyone but the members. Each payload
 * is read from the table's own config, so the two never part, and the view
 * is not marked as edited until the table is. Its name is a message of the
 * prose, which the tabs resolve.
 */
export const PEOPLE_VIEWS: {
  id: string;
  name: Extract<AppProsaryMessage, string>;
  payload: PeopleView;
}[] = [
  {
    id: "all",
    name: "admin.people.allView",
    payload: peopleView.parse({
      pageSize: PEOPLE_TABLE.initialState?.pagination?.pageSize,
      columnVisibility: PEOPLE_TABLE.initialState?.columnVisibility,
    }),
  },
  {
    id: "staff",
    name: "admin.people.staffView",
    payload: peopleView.parse({
      pageSize: PEOPLE_TABLE.initialState?.pagination?.pageSize,
      columnVisibility: PEOPLE_TABLE.initialState?.columnVisibility,
      clauses: [{ kind: "filter", key: "role", op: "not", value: "member" }],
    }),
  },
];
