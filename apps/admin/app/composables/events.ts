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

/** The admin's API for the events, and one of them by id. */
const ROUTE = "/api/events";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** The way to an event's editor. */
const link: RecordLink<EventRecord> = (record) => `/events/${record.id}`;

/**
 * The events table: the events a page at a time from `/api/events`, each
 * row the way to its editor, as is the `Edit` action on it. The table is
 * built as the page is set up, its columns and its action named in the
 * reader's language of that moment; the layout sets the page up again when
 * the language changes.
 */
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

/** The event the route names, by id, or `null` when no event has it. */
export const useEventRecord = () => useRecord("event", endpoint, eventRecord);

/**
 * The editor of an event: over its record, which it replaces on save and
 * can delete, or over none, which it creates. Either way it leaves for the
 * list once done.
 */
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
