import type { Sermon } from "@bbf/schema/types";

import type { SermonArguments } from "../types";

/**
 * What `admin.sermons.upsert` takes, from a sermon as the feed lists it.
 * The model's `published` is an ISO 8601 timestamp; the slot is a
 * `timestamptz`, and takes the moment as a `Date`.
 */
export const toSermonArguments = (sermon: Sermon): SermonArguments => ({
  id: sermon.id,
  title: sermon.title,
  published: new Date(sermon.published),
  thumbnail: sermon.thumbnail,
});
