import type { StaffBody, StaffRecord } from "@bbf/schema/types";

import type { StaffForm } from "../types";

import { fromHtml, toHtml } from "./hast";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

export const toStaffForm = (record: StaffRecord): StaffForm => ({
  name: record.name,
  role: record.role,
  summary: record.summary,
  bio: record.bio === undefined ? undefined : toHtml(record.bio),
  photo: record.photo,
  email: record.email,
  phone: record.phone,
  status: record.status,
});

export const toStaffBody = (form: StaffForm): StaffBody => {
  const bio = written(form.bio);
  return {
    name: form.name.trim(),
    role: form.role,
    summary: written(form.summary),
    bio: bio === undefined ? undefined : fromHtml(bio),
    photo: written(form.photo),
    email: written(form.email),
    phone: written(form.phone),
    status: form.status,
  };
};
