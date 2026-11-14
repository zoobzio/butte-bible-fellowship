import type { AboutBody, AboutForm, AboutRecord } from "@bbf/schema/types";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

export const toAboutForm = (record: AboutRecord): AboutForm => ({
  title: record.title,
  description: record.description,
});

export const toAboutBody = (form: AboutForm): AboutBody => ({
  title: form.title.trim(),
  description: written(form.description),
});
