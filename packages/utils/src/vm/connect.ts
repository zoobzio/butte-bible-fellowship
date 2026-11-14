import type {
  ConnectBody,
  ConnectForm,
  ConnectRecord,
} from "@bbf/schema/types";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

/**
 * The record's metadata as the form holds it. What is written on the page
 * is no part of the form.
 */
export const toConnectForm = (record: ConnectRecord): ConnectForm => ({
  title: record.title,
  description: record.description,
  address: record.address,
  phone: record.phone,
  fax: record.fax,
  email: record.email,
  hours: record.hours,
});

export const toConnectBody = (form: ConnectForm): ConnectBody => ({
  title: form.title.trim(),
  description: written(form.description),
  address: form.address.trim(),
  phone: written(form.phone),
  fax: written(form.fax),
  email: written(form.email),
  hours: written(form.hours),
});
