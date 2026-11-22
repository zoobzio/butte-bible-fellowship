import type { PersonForm, PersonRecord } from "@bbf/schema/types";
import type { FormOptions } from "#imports";

import type { PictureLabels } from "~/types/editor";

import { PERSON_AVATAR_TYPES, personForm, personRecord } from "@bbf/schema";
import { toPersonBody, toPersonForm } from "@bbf/utils/vm";
import { computed, createForm, ref, useNuxtApp, useRouter } from "#imports";
import { useApi } from "~/composables/api";
import { ROUTE, avatar, endpoint } from "~/composables/people/routes";
import { ROLE_OPTIONS } from "~/constants/editor";
import { link } from "~/constants/people";
import { toOptions } from "~/utils/editor";
import { failure } from "~/utils/errors";
import { toImageRequest } from "~/utils/image";
import { initials } from "~/utils/people";

/**
 * An optional field once cleared: the control writes an empty string, the
 * body wants nothing. What is written is kept as typed; the body trims it.
 */
const blank = (value: string | undefined): string | undefined =>
  value?.trim() === "" ? undefined : value;

/**
 * The form of one person's details: a new person when there is no record.
 * It is one column of fields and does not hold the bio, which is written
 * on its own, beside it. The form's store is shared under its id, so each
 * visit starts over from the record. The form carries no title of its own:
 * the page's header names the person, and its menu is where the person is
 * deleted.
 *
 * A person that exists has their photo as the first of their fields: the
 * one they keep, an image picked to take its place, or none. The photo is
 * written with the details, in a request of its own after theirs: an image
 * picked is uploaded, and none where one was kept is removed. A new person
 * has no such field: there is nothing yet to write a photo to. `picture`
 * is what the photo's control says of what it does, and `fallback` what
 * stands in for no photo: the initials of the names as they are written.
 *
 * A new person saved opens on
 * their own page, where the photo and the bio wait; one changed stays on
 * the page, its fields showing what was kept, a phone number in the one
 * way it is written, and the record saved is handed to `saved`, for the
 * page to name them afresh. A save that fails reports through `error`,
 * which the next submit clears.
 *
 * For the page that saves the person as a whole, `dirty` holds from the
 * first change to the next save, `save` submits the form without throwing,
 * and `reset` puts the fields back as they were last saved.
 */
export const usePersonEditor = (
  record: PersonRecord | null,
  saved: (record: PersonRecord) => void = () => {},
) => {
  const api = useApi();
  const router = useRouter();
  const { $t } = useNuxtApp();

  /* The record as it was last saved: what a reset puts back. */
  let kept = record;

  const photo: FormOptions<PersonForm>["fields"] =
    record === null
      ? []
      : [
          {
            type: "image",
            key: "photo",
            label: $t.admin.person.picture(),
            accept: PERSON_AVATAR_TYPES.join(","),
          },
        ];

  const labels: PictureLabels = {
    upload: $t.admin.person.photoUpload(),
    change: $t.admin.person.photoChange(),
    remove: $t.admin.person.photoRemove(),
  };

  const useForm = createForm<PersonForm>("person", {
    fields: [
      ...photo,
      {
        type: "text",
        key: "firstName",
        label: $t.admin.person.firstName(),
        required: true,
      },
      {
        type: "text",
        key: "lastName",
        label: $t.admin.person.lastName(),
        required: true,
      },
      {
        type: "select",
        key: "role",
        label: $t.admin.person.role(),
        required: true,
        placeholder: "",
        options: toOptions(ROLE_OPTIONS, (message) => $t(message)),
      },
      {
        type: "text",
        key: "title",
        label: $t.admin.person.title(),
        hint: $t.admin.person.titleHint(),
      },
      { type: "email", key: "email", label: $t.admin.person.email() },
      { type: "tel", key: "phone", label: $t.admin.person.phone() },
      {
        type: "textarea",
        key: "address",
        label: $t.admin.person.address(),
        rows: 2,
      },
      {
        type: "date-input",
        key: "birthday",
        label: $t.admin.person.birthday(),
      },
      {
        type: "textarea",
        key: "summary",
        label: $t.admin.editor.summary(),
        rows: 3,
      },
    ],
    schema: personForm,
    /* Whoever is added is a member until given another role. */
    defaults: { role: "member" },
    middleware: {
      title: blank,
      summary: blank,
      email: blank,
      phone: blank,
      address: blank,
      birthday: blank,
    },
    submit: async (form) => {
      const payload = personForm.parse(form.payload);
      const body = toPersonBody(payload);
      if (record === null) {
        const created = await api(ROUTE, { method: "POST", body });
        await router.push(link(personRecord.parse(created)));
        return;
      }
      kept = personRecord.parse(
        await api(endpoint(record.id), { method: "PUT", body }),
      );
      const request = toImageRequest(payload.photo, kept.photo);
      if (request !== null) {
        kept = personRecord.parse(await api(avatar(record.id), request));
      }
      form.update(toPersonForm(kept));
      saved(kept);
    },
  });

  const form = useForm();
  const dirty = ref(false);
  const error = ref<string | null>(null);

  const fill = () => {
    form.reset();
    if (kept !== null) form.update(toPersonForm(kept));
    dirty.value = false;
  };
  fill();

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
  const fallback = computed(() =>
    initials(form.payload.firstName ?? "", form.payload.lastName ?? ""),
  );

  /* What fails reports through `error`: the rejection has no other use. */
  const save = async () => {
    await form.submit().catch(() => {});
  };

  const reset = () => {
    if (form.submitting) return;
    error.value = null;
    fill();
  };

  return {
    form,
    picture: labels,
    fallback,
    error,
    dirty,
    saving,
    save,
    reset,
  };
};
