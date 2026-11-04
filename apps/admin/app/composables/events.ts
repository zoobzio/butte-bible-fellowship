import type { EventRecord } from "@bbf/schema/types";

import { eventListing, eventRecord } from "@bbf/schema";
import { createTable, navigateTo, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { useEditor } from "~/composables/editor";
import { useListingFetch } from "~/composables/listing";
import { useRecord } from "~/composables/records";
import { EVENTS_TABLE, link } from "~/constants/events";
import { toEventBody, toEventDraft } from "~/utils/events";

const ROUTE = "/api/events";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

/**
 * The events table: the config of the constants over the admin's API, each
 * row's edit the way to the event's editor. The layer's factory names the
 * columns and the action from the prose as the table is built in setup.
 */
export const useEventsTable = createTable<EventRecord>("events", {
  ...EVENTS_TABLE,
  fetch: useListingFetch(ROUTE, eventListing),
  actions: {
    edit: {
      label: "admin.editor.edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
  },
});

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
