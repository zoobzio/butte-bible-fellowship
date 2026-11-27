import type { SermonForm, SermonRecord } from "@bbf/schema/types";

/** A sermon's details as the admin's form holds them, field for field. */
export const toSermonForm = (record: SermonRecord): SermonForm => ({
  slug: record.slug,
  title: record.title,
  speaker: record.speaker,
  summary: record.summary,
  image: record.image,
  video: record.video,
  date: record.date,
  status: record.status,
});
