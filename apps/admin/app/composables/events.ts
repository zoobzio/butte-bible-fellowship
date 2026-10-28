import type { EventRecord } from "@bbf/schema/types";

import type { RecordLink } from "~/types/listing";

import { eventListing, eventRecord } from "@bbf/schema";
import { createTable, navigateTo, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { useEditor } from "~/composables/editor";
import { useListingFetch } from "~/composables/listing";
import { useRecord } from "~/composables/records";
import { EVENTS_TABLE } from "~/constants/events";
import { toEventBody, toEventDraft } from "~/utils/events";
import { toTableDescriptors } from "~/utils/listing";

const ROUTE = "/api/events";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

const link: RecordLink<EventRecord> = (record) => `/events/${record.id}`;

export const useEventsTable = () => {
  const { $t } = useNuxtApp();

  const useTable = createTable<EventRecord>("events", {
    ...toTableDescriptors(EVENTS_TABLE, (message) => $t(message)),
    fetch: useListingFetch(ROUTE, eventListing),
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

export const useEventRecord = () => useRecord("event", endpoint, eventRecord);

export const useEventEditor = (record: EventRecord | null) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  return useEditor({
    draft: toEventDraft(record ?? undefined),
    body: toEventBody,
    save: (body) =>
      record === null
        ? api(ROUTE, { method: "POST", body })
        : api(endpoint(record.id), { method: "PUT", body }),
    remove:
      record === null
        ? undefined
        : {
            confirm: $t.admin.editor.confirm({ name: record.title }),
            run: () => api(endpoint(record.id), { method: "DELETE" }),
          },
    back: "/events",
  });
};
