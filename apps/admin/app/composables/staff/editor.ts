import type { StaffForm, StaffRecord } from "@bbf/schema/types";

import { staffForm, staffRecord } from "@bbf/schema";
import { toStaffBody, toStaffForm } from "@bbf/utils/vm";
import { createForm, ref, useNuxtApp, useRouter } from "#imports";
import { useApi } from "~/composables/api";
import { ROUTE, endpoint } from "~/composables/staff/routes";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "~/constants/editor";
import { link } from "~/constants/staff";
import { toOptions } from "~/utils/editor";
import { failure } from "~/utils/errors";

/**
 * An optional field once cleared: the control writes an empty string, the
 * body wants nothing. What is written is kept as typed; the body trims it.
 */
const blank = (value: string | undefined): string | undefined =>
  value?.trim() === "" ? undefined : value;

/**
 * The form of one member's details: a new member when there is no record.
 * It is one column of fields and holds neither the photo nor the bio, each
 * of which is written on its own, beside it. The form's store is shared
 * under its id, so each visit starts over from the record. The form
 * carries no title of its own: the page's header names the member, and
 * its menu is where the member is deleted. A new member saved opens on
 * their own page, where the photo and the bio wait; one changed stays on
 * the page, its fields showing what was kept, a phone number in the one
 * way it is written, and the record saved is handed to `saved`, for the
 * page to name them afresh. A save that fails reports through `error`,
 * which the next submit clears.
 */
export const useStaffEditor = (
  record: StaffRecord | null,
  saved: (record: StaffRecord) => void = () => {},
) => {
  const api = useApi();
  const router = useRouter();
  const { $t } = useNuxtApp();

  const useForm = createForm<StaffForm>("staff", {
    fields: [
      {
        type: "text",
        key: "name",
        label: $t.admin.member.name(),
        required: true,
      },
      {
        type: "select",
        key: "role",
        label: $t.admin.member.role(),
        required: true,
        placeholder: "",
        options: toOptions(ROLE_OPTIONS, (message) => $t(message)),
      },
      {
        type: "select",
        key: "status",
        label: $t.admin.editor.status(),
        options: toOptions(STATUS_OPTIONS, (message) => $t(message)),
      },
      { type: "email", key: "email", label: $t.admin.member.email() },
      { type: "tel", key: "phone", label: $t.admin.member.phone() },
      {
        type: "textarea",
        key: "summary",
        label: $t.admin.editor.summary(),
        rows: 3,
      },
    ],
    schema: staffForm,
    defaults: { status: "draft" },
    middleware: { summary: blank, email: blank, phone: blank },
    submit: async (form) => {
      const body = toStaffBody(staffForm.parse(form.payload));
      if (record === null) {
        const created = await api(ROUTE, { method: "POST", body });
        await router.push(link(staffRecord.parse(created)));
        return;
      }
      const changed = staffRecord.parse(
        await api(endpoint(record.id), { method: "PUT", body }),
      );
      form.update(toStaffForm(changed));
      saved(changed);
    },
  });

  const form = useForm();
  form.reset();
  if (record !== null) form.update(toStaffForm(record));

  const error = ref<string | null>(null);

  form.on("rejected", () => {
    error.value = null;
  });
  form.on("failed", ({ cause }) => {
    error.value = failure(cause) ?? $t.admin.editor.failed();
  });

  return { form, error };
};
