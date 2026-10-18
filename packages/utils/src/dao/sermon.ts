import type { SermonBody } from "@bbf/schema/types";

import type { SermonArguments } from "../types";

/**
 * What writing a sermon takes, from the body a request carries. A field the
 * body leaves out is written as null: a `video` the sermon has not, or not
 * yet; what it defaults, the `status`, is written as the body parsed it.
 * For `admin.sermons.update`, spread it with the `id` of the sermon it
 * replaces.
 */
export const toSermonArguments = (body: SermonBody): SermonArguments => ({
  slug: body.slug,
  title: body.title,
  speaker: body.speaker ?? null,
  summary: body.summary ?? null,
  body: body.body ?? null,
  image: body.image ?? null,
  video: body.video ?? null,
  date: body.date,
  status: body.status,
});
