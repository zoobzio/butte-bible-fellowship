import type { H3Event } from "h3";

import type { Sermon } from "@bbf/schema/types";

import { useRuntimeConfig } from "nitropack/runtime";

import { parseSermonFeed, sermonFeedUrl } from "~~/server/utils/sermons";

/**
 * The channel's sermons, as its YouTube feed lists them, for the request
 * being answered: the channel is the one the runtime config names, and
 * `read` asks YouTube for its feed and hands back the sermons in it. A feed
 * that cannot be read is an error, for the endpoint to decide about.
 */
export const useSermonFeed = (event: H3Event) => {
  const { channel } = useRuntimeConfig(event).public.youtube;
  const url = sermonFeedUrl(channel);

  const read = async (): Promise<Sermon[]> => {
    const xml = await $fetch<string>(url, { responseType: "text" });
    return parseSermonFeed(xml);
  };

  return { read };
};
