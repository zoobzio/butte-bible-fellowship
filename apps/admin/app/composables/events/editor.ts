import type { EventForm, EventRecord } from "@bbf/schema/types";

import { eventForm, eventRecord } from "@bbf/schema";
import { toEventBody, toEventForm } from "@bbf/utils/vm";
import { computed, createForm, ref, useNuxtApp, useRouter } from "#imports";
import { useApi } from "~/composables/api";
import { ROUTE, endpoint } from "~/composables/events/routes";
import { WEEK_OPTIONS } from "~/constants/editor";
import { link } from "~/constants/events";
import { toOptions } from "~/utils/editor";
import { failure } from "~/utils/errors";

/**
 * An optional field once cleared: the control writes an empty string, the
 * body wants nothing. What is written is kept as typed; the body trims it.
 */
const blank = (value: string | undefined): string | undefined =>
  value?.trim() === "" ? undefined : value;

/**
 * The weeks once none is picked: the select writes an empty list, and an
 * event held every week picks no weeks at all.
 */
const picked = (weeks: EventForm["weeks"]): EventForm["weeks"] =>
  weeks?.length === 0 ? undefined : weeks;

/**
 * The form of one event's details: a new event when there is no record.
 * It is one column of fields and holds neither the picture nor what is
 * written about the event, each of which is written on its own, beside it.
 * The form's store is shared under its id, so each visit starts over from
 * the record. The form carries no title of its own: the page's header
 * names the event, and its menu is where the event is deleted.
 *
 * An event is held on its date, and every week on that date's day of the
 * week once it is marked as recurring. Only a recurring event picks its
 * weeks, so the weeks are cleared when the mark is taken off.
 *
 * A new event saved opens on its own page, where the picture and the
 * writing wait; one changed stays on the page, its fields showing what was
 * kept, and the record saved is handed to `saved`, for the page to name it
 * afresh. A save that fails reports through `error`, which the next submit
 * clears.
 *
 * For the page that saves the event as a whole, `dirty` holds from the
 * first change to the next save, `save` submits the form without throwing,
 * and `reset` puts the fields back as they were last saved.
 */
export const useEventEditor = (
  record: EventRecord | null,
  saved: (record: EventRecord) => void = () => {},
) => {
  const api = useApi();
  const router = useRouter();
  const { $t } = useNuxtApp();

  /* The record as it was last saved: what a reset puts back. */
  let kept = record;

  const useForm = createForm<EventForm>("event", {
    fields: [
      {
        type: "text",
        key: "title",
        label: $t.admin.event.title(),
        required: true,
      },
      {
        type: "text",
        key: "slug",
        label: $t.admin.editor.slug(),
        hint: $t.admin.editor.slugHint(),
        required: true,
      },
      {
        type: "date-input",
        key: "date",
        label: $t.admin.event.date(),
        hint: $t.admin.event.dateHint(),
        required: true,
      },
      {
        type: "time",
        key: "start",
        label: $t.admin.event.start(),
        required: true,
      },
      { type: "time", key: "end", label: $t.admin.event.end() },
      {
        type: "checkbox",
        key: "recurring",
        label: $t.admin.event.recurring(),
      },
      {
        type: "multi-select",
        key: "weeks",
        label: $t.admin.event.weeks(),
        hint: $t.admin.event.weeksHint(),
        placeholder: $t.admin.event.weeksEmpty(),
        options: toOptions(WEEK_OPTIONS, (message) => $t(message)),
      },
      {
        type: "textarea",
        key: "summary",
        label: $t.admin.editor.summary(),
        rows: 3,
      },
    ],
    schema: eventForm,
    defaults: { recurring: false },
    middleware: { summary: blank, weeks: picked },
    submit: async (form) => {
      const body = toEventBody(eventForm.parse(form.payload));
      if (record === null) {
        const created = await api(ROUTE, { method: "POST", body });
        await router.push(link(eventRecord.parse(created)));
        return;
      }
      const changed = eventRecord.parse(
        await api(endpoint(record.id), { method: "PUT", body }),
      );
      kept = changed;
      form.update(toEventForm(changed));
      saved(changed);
    },
  });

  const form = useForm();
  const dirty = ref(false);
  const error = ref<string | null>(null);

  const fill = () => {
    form.reset();
    if (kept !== null) form.update(toEventForm(kept));
    dirty.value = false;
  };
  fill();

  /* Only a recurring event picks its weeks: they go when the mark does. */
  form.on("change", ({ field }) => {
    if (field !== "payload") return;
    if (!form.payload.recurring && form.payload.weeks !== undefined) {
      form.set("weeks", undefined);
    }
  });

  form.on("change", ({ field }) => {
    if (field === "payload") dirty.value = true;
  });
  form.on("submitted", () => {
    error.value = null;
    dirty.value = false;
  });
  form.on("rejected", () => {
    error.value = null;
  });
  form.on("failed", ({ cause }) => {
    error.value = failure(cause) ?? $t.admin.editor.failed();
  });

  const saving = computed(() => form.submitting);

  /* What fails reports through `error`: the rejection has no other use. */
  const save = async () => {
    await form.submit().catch(() => {});
  };

  const reset = () => {
    if (form.submitting) return;
    error.value = null;
    fill();
  };

  return { form, error, dirty, saving, save, reset };
};
