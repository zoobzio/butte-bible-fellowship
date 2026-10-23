import type { StaffRecord } from "@bbf/schema/types";

import type { RecordLink } from "~/types/listing";

import { staffListing, staffRecord } from "@bbf/schema";
import { createTable, navigateTo } from "#imports";
import { useApi } from "~/composables/api";
import { useEditor } from "~/composables/editor";
import { useListingFetch } from "~/composables/listing";
import { useRecord } from "~/composables/records";
import { DELETE_PROMPT } from "~/constants/editor";
import { STAFF_TABLE } from "~/constants/staff";
import { toStaffBody, toStaffDraft } from "~/utils/staff";

/** The admin's API for the staff, and one of them by id. */
const ROUTE = "/api/staff";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** The way to a member's editor. */
const link: RecordLink<StaffRecord> = (record) => `/staff/${record.id}`;

/**
 * The staff table: the members a page at a time from `/api/staff`, each
 * row the way to its editor, as is the `Edit` action on it.
 */
const useTable = createTable<StaffRecord>("staff", {
  ...STAFF_TABLE,
  fetch: useListingFetch(ROUTE, staffListing),
  actions: {
    edit: {
      label: "Edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
  },
});

/** The staff table's service, and the way to each row's editor. */
export const useStaffTable = () => ({ table: useTable(), link });

/** The member the route names, by id, or `null` when no member has it. */
export const useStaffRecord = () => useRecord("staff", endpoint, staffRecord);

/**
 * The editor of a member: over their record, which it replaces on save and
 * can delete, or over none, which it creates. Either way it leaves for the
 * list once done.
 */
export const useStaffEditor = (record: StaffRecord | null) => {
  const api = useApi();

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
        : () => api(endpoint(record.id), { method: "DELETE" }),
    back: "/staff",
    confirm: `Delete ${record?.name ?? "this member"}? ${DELETE_PROMPT}`,
  });
};
