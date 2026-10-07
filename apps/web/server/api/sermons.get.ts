import { defineCachedEventHandler, useRuntimeConfig } from "nitropack/runtime";

import { SERMONS_MAX_AGE } from "#shared/constants/sermons";
import { parseSermonFeed, sermonFeedUrl } from "../utils/sermons";

/**
 * The channel's latest sermons, read from its YouTube feed. The answer is
 * kept for {@link SERMONS_MAX_AGE} and refreshed in the background after, so
 * YouTube is asked at most once in that time however many visitors ask here.
 * A feed that cannot be read is an error, which is never kept.
 */
export default defineCachedEventHandler(
  async (event) => {
    const { channel } = useRuntimeConfig(event).public.youtube;
    const xml = await $fetch<string>(sermonFeedUrl(channel), {
      responseType: "text",
    });
    return parseSermonFeed(xml);
  },
  { name: "sermons", maxAge: SERMONS_MAX_AGE, swr: true },
);
