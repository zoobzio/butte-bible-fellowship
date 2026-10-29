import type { StaffForm, StaffRecord } from "@bbf/schema/types";

import type { RecordLink } from "~/types/listing";

import { staffForm, staffListing, staffRecord } from "@bbf/schema";
import { toStaffBody, toStaffForm } from "@bbf/utils/vm";
import {
  createForm,
  createTable,
  navigateTo,
  ref,
  useNuxtApp,
  useRouter,
} from "#imports";
import { useApi } from "~/composables/api";
import { useListingFetch } from "~/composables/listing";
import { useRecord } from "~/composables/records";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "~/constants/editor";
import { FILTER_DAYS } from "~/constants/listing";
import { STAFF_TABLE } from "~/constants/staff";
import { toOptions } from "~/utils/editor";
import { failure } from "~/utils/errors";
import { recentDays, toTableDescriptors, withDays } from "~/utils/listing";

const ROUTE = "/api/staff";
const BACK = "/staff";
const endpoint = (id: number): string => `${ROUTE}/${id}`;

const link: RecordLink<StaffRecord> = (record) => `/staff/${record.id}`;

/**
 * An optional field once cleared: the control writes an empty string, the
 * body wants nothing. What is written is kept as typed; the body trims it.
 */
const blank = (value: string | undefined): string | undefined =>
  value?.trim() === "" ? undefined : value;

export const useStaffTable = () => {
  const { $t } = useNuxtApp();

  const useTable = createTable<StaffRecord>("staff", {
    ...toTableDescriptors(
      withDays(STAFF_TABLE, recentDays(FILTER_DAYS)),
      (message) => $t(message),
    ),
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

/**
 * The form of one member: a new one when there is no record. The form's
 * store is shared under its id, so each visit starts over from the record.
 * The form carries no title of its own: the page's header names the member.
 * A save that fails reports through `error`, which the next submit clears.
 */
export const useStaffEditor = (record: StaffRecord | null) => {
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
        colspan: 6,
      },
      {
        type: "select",
        key: "role",
        label: $t.admin.member.role(),
        required: true,
        placeholder: "",
        options: toOptions(ROLE_OPTIONS, (message) => $t(message)),
        colspan: 6,
      },
      {
        type: "select",
        key: "status",
        label: $t.admin.editor.status(),
        options: toOptions(STATUS_OPTIONS, (message) => $t(message)),
        colspan: 6,
      },
      { type: "url", key: "photo", label: $t.admin.member.photo(), colspan: 6 },
      {
        type: "email",
        key: "email",
        label: $t.admin.member.email(),
        colspan: 6,
      },
      { type: "tel", key: "phone", label: $t.admin.member.phone(), colspan: 6 },
      { type: "text", key: "summary", label: $t.admin.editor.summary() },
      { type: "richtext", key: "bio", label: $t.admin.member.bio() },
    ],
    schema: staffForm,
    defaults: { status: "draft" },
    middleware: {
      summary: blank,
      bio: blank,
      photo: blank,
      email: blank,
      phone: blank,
    },
    submit: async (form) => {
      const body = toStaffBody(staffForm.parse(form.payload));
      await (record === null
        ? api(ROUTE, { method: "POST", body })
        : api(endpoint(record.id), { method: "PUT", body }));
      await router.push(BACK);
    },
  });

  const form = useForm();
  form.reset();
  if (record !== null) form.update(toStaffForm(record));

  const error = ref<string | null>(null);
  const removing = ref(false);
  const removable = record !== null;

  form.on("rejected", () => {
    error.value = null;
  });
  form.on("failed", ({ cause }) => {
    error.value = failure(cause) ?? $t.admin.editor.failed();
  });

  const destroy = async () => {
    if (record === null || removing.value || form.submitting) return;
    if (!globalThis.confirm($t.admin.editor.confirm({ name: record.name }))) {
      return;
    }
    error.value = null;
    removing.value = true;
    try {
      await api(endpoint(record.id), { method: "DELETE" });
      await router.push(BACK);
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      removing.value = false;
    }
  };

  return { form, error, removing, removable, destroy };
};
