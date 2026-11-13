import type { ContentBody } from "@bbf/schema/types";

import type { ContentArguments } from "../types";

export const toContentArguments = (body: ContentBody): ContentArguments => ({
  slug: body.slug,
  title: body.title,
  description: body.description ?? null,
});
