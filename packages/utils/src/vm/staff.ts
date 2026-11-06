import type { StaffBody, StaffForm, StaffRecord } from "@bbf/schema/types";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

export const toStaffForm = (record: StaffRecord): StaffForm => ({
  name: record.name,
  role: record.role,
  summary: record.summary,
  email: record.email,
  phone: record.phone,
  status: record.status,
});

export const toStaffBody = (form: StaffForm): StaffBody => ({
  name: form.name.trim(),
  role: form.role,
  summary: written(form.summary),
  email: written(form.email),
  phone: written(form.phone),
  status: form.status,
});
