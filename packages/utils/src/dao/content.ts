import type { ContentBody, ContentDraft } from "@bbf/schema/types";

import type { ContentArguments, ContentDraftArguments } from "../types";

export const toContentArguments = (
  body: ContentBody,
): Omit<ContentArguments, "id"> => ({
  slug: body.slug,
  title: body.title,
  description: body.description ?? null,
});

/** A new page: its metadata, and the folder it is made in, null for none. */
export const toContentDraftArguments = (
  draft: ContentDraft,
): ContentDraftArguments => ({
  ...toContentArguments(draft),
  folder_id: draft.folder ?? null,
});
