import type { H3Event } from "h3";

import type { FeedVideo } from "~~/server/types/feed";

import { createError } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";

import { FEED, FEED_TIMEOUT } from "~~/server/constants/youtube";
import { parseFeed } from "~~/server/utils/feed";

/**
 * The church's YouTube channel, as its public feed lists it: the channel
 * the runtime config names, read with no key.
 */
export const useYoutube = (event: H3Event) => {
  const { channel } = useRuntimeConfig(event).public.youtube;

  /**
   * The channel's latest recordings, the fifteen newest at most, the
   * newest first. A feed that cannot be reached, or answers with anything
   * but itself, is YouTube's fault and not the asker's: a 502.
   */
  const videos = async (): Promise<FeedVideo[]> => {
    const url = `${FEED}?channel_id=${encodeURIComponent(channel)}`;
    let response: Response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(FEED_TIMEOUT),
      });
    } catch (cause) {
      throw createError({
        statusCode: 502,
        message: "YouTube could not be reached",
        cause,
      });
    }
    if (!response.ok) {
      throw createError({
        statusCode: 502,
        message: `YouTube answered ${response.status}`,
      });
    }
    return parseFeed(await response.text());
  };

  return { videos };
};
