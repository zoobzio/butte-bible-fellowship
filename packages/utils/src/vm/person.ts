import type { PersonBody, PersonForm, PersonRecord } from "@bbf/schema/types";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

export const toPersonForm = (record: PersonRecord): PersonForm => ({
  firstName: record.firstName,
  lastName: record.lastName,
  role: record.role,
  title: record.title,
  summary: record.summary,
  email: record.email,
  phone: record.phone,
  address: record.address,
  birthday: record.birthday,
  photo: record.photo,
});

/**
 * The details a form holds as a body writes them. The photo is no part of
 * the body: it is written on its own.
 */

export const toPersonBody = (form: PersonForm): PersonBody => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  role: form.role,
  title: written(form.title),
  summary: written(form.summary),
  email: written(form.email),
  phone: written(form.phone),
  address: written(form.address),
  birthday: written(form.birthday),
});
