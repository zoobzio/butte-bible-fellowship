import type { SermonBody } from "@bbf/schema/types";

import type { SermonArguments } from "../types";

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
