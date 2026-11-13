import type {
  ContentBody,
  ContentForm,
  ContentRecord,
} from "@bbf/schema/types";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

export const toContentForm = (record: ContentRecord): ContentForm => ({
  slug: record.slug,
  title: record.title,
  description: record.description,
});

export const toContentBody = (form: ContentForm): ContentBody => ({
  slug: form.slug.trim(),
  title: form.title.trim(),
  description: written(form.description),
});
