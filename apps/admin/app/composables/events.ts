import type { EventRecord } from "@bbf/schema/types";

import type { RecordLink } from "~/types/listing";

import { eventListing, eventRecord } from "@bbf/schema";
import { createTable, navigateTo } from "#imports";
import { useApi } from "~/composables/api";
import { useEditor } from "~/composables/editor";
import { useListingFetch } from "~/composables/listing";
import { useRecord } from "~/composables/records";
import { DELETE_PROMPT } from "~/constants/editor";
import { EVENTS_TABLE } from "~/constants/events";
import { toEventBody, toEventDraft } from "~/utils/events";

/** The admin's API for the events, and one of them by id. */
const ROUTE = "/api/events";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** The way to an event's editor. */
const link: RecordLink<EventRecord> = (record) => `/events/${record.id}`;

/**
 * The events table: the events a page at a time from `/api/events`, each
 * row the way to its editor, as is the `Edit` action on it.
 */
const useTable = createTable<EventRecord>("events", {
  ...EVENTS_TABLE,
  fetch: useListingFetch(ROUTE, eventListing),
  actions: {
    edit: {
      label: "Edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
  },
});

/** The events table's service, and the way to each row's editor. */
export const useEventsTable = () => ({ table: useTable(), link });

/** The event the route names, by id, or `null` when no event has it. */
export const useEventRecord = () => useRecord("event", endpoint, eventRecord);

/**
 * The editor of an event: over its record, which it replaces on save and
 * can delete, or over none, which it creates. Either way it leaves for the
 * list once done.
 */
export const useEventEditor = (record: EventRecord | null) => {
  const api = useApi();

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
        : () => api(endpoint(record.id), { method: "DELETE" }),
    back: "/events",
    confirm: `Delete ${record?.title ?? "this event"}? ${DELETE_PROMPT}`,
  });
};
