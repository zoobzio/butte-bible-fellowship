import { defineCachedEventHandler } from "nitropack/runtime";

import { useSermonFeed } from "~~/server/composables/sermons";
import { SERMONS_MAX_AGE } from "~~/server/constants/sermons";

/**
 * The channel's latest sermons, read from its YouTube feed. The answer is
 * kept for {@link SERMONS_MAX_AGE} and refreshed in the background after, so
 * YouTube is asked at most once in that time however many visitors ask here.
 * A feed that cannot be read is an error, which is never kept.
 */
export default defineCachedEventHandler(
  (event) => useSermonFeed(event).read(),
  { name: "sermons", maxAge: SERMONS_MAX_AGE, swr: true },
);
