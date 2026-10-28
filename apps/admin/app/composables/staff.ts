import type { Hast, StaffRecord } from "@bbf/schema/types";

import type { RecordLink } from "~/types/listing";

import { hast, staffListing, staffRecord } from "@bbf/schema";
import { hast as tree } from "@zoobzio/editor";
import { createEditor, createTable, navigateTo, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { useEditor } from "~/composables/editor";
import { useListingFetch } from "~/composables/listing";
import { useRecord } from "~/composables/records";
import { STAFF_TABLE } from "~/constants/staff";
import { toStaffBody, toStaffDraft } from "~/utils/staff";
import { toTableDescriptors } from "~/utils/listing";

const ROUTE = "/api/staff";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

const link: RecordLink<StaffRecord> = (record) => `/staff/${record.id}`;

const EMPTY: Hast = { type: "root", children: [] };

const useBio = createEditor("staff-bio", tree);

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

export const useStaffRecord = () => useRecord("staff", endpoint, staffRecord);

export const useStaffEditor = (record: StaffRecord | null) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const bio = useBio();
  bio.load(record?.bio ?? EMPTY);

  const editor = useEditor({
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

  bio.on("updated", () => {
    editor.draft.bio = bio.empty ? undefined : hast.parse(bio.document);
  });

  return { ...editor, bio };
};
