import type { StaffRecord } from "@bbf/schema/types";

import type { RecordLink } from "~/types/listing";

import { staffListing, staffRecord } from "@bbf/schema";
import { createTable, navigateTo, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { useEditor } from "~/composables/editor";
import { useListingFetch } from "~/composables/listing";
import { useRecord } from "~/composables/records";
import { STAFF_TABLE } from "~/constants/staff";
import { toStaffBody, toStaffDraft } from "~/utils/staff";
import { toTableDescriptors } from "~/utils/listing";

/** The admin's API for the staff, and one of them by id. */
const ROUTE = "/api/staff";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** The way to a member's editor. */
const link: RecordLink<StaffRecord> = (record) => `/staff/${record.id}`;

/**
 * The staff table: the members a page at a time from `/api/staff`, each
 * row the way to its editor, as is the `Edit` action on it. The table is
 * built as the page is set up, its columns and its action named in the
 * reader's language of that moment; the layout sets the page up again when
 * the language changes.
 */
export const useStaffTable = () => {
  const { $t } = useNuxtApp();

  const useTable = createTable<StaffRecord>("staff", {
    ...toTableDescriptors(STAFF_TABLE, (message) => $t(message)),
    fetch: useListingFetch(ROUTE, staffListing),
    actions: {
      edit: {
        label: $t.admin.editor.edit(),
        action: (record) => {
          navigateTo(link(record));
        },
      },
    },
  });

  return { table: useTable(), link };
};

/** The member the route names, by id, or `null` when no member has it. */
export const useStaffRecord = () => useRecord("staff", endpoint, staffRecord);

/**
 * The editor of a member: over their record, which it replaces on save and
 * can delete, or over none, which it creates. Either way it leaves for the
 * list once done.
 */
export const useStaffEditor = (record: StaffRecord | null) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  return useEditor({
    draft: toStaffDraft(record ?? undefined),
    body: toStaffBody,
    save: (body) =>
      record === null
        ? api(ROUTE, { method: "POST", body })
        : api(endpoint(record.id), { method: "PUT", body }),
    remove:
      record === null
        ? undefined
        : {
            confirm: $t.admin.editor.confirm({ name: record.name }),
            run: () => api(endpoint(record.id), { method: "DELETE" }),
          },
    back: "/staff",
  });
};
