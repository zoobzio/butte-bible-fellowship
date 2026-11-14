import type { HomeBody, HomeForm, HomeRecord } from "@bbf/schema/types";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

/**
 * The record's metadata as the form holds it. The picture and what is
 * written on the page are no part of the form.
 */
export const toHomeForm = (record: HomeRecord): HomeForm => ({
  title: record.title,
  description: record.description,
  heroHeading: record.heroHeading,
  heroDescription: record.heroDescription,
  heroAction: record.heroAction,
  heroLink: record.heroLink,
});

export const toHomeBody = (form: HomeForm): HomeBody => ({
  title: form.title.trim(),
  description: written(form.description),
  heroHeading: form.heroHeading.trim(),
  heroDescription: form.heroDescription.trim(),
  heroAction: form.heroAction.trim(),
  heroLink: form.heroLink.trim(),
});
