import type { ComputedRef } from "vue";

import type { Sermon } from "@bbf/schema/types";

import { sermons } from "@bbf/schema";

import { computed, useAsyncData } from "#imports";

/**
 * The channel's latest sermons, newest first, from the site's own
 * `/api/sermons`, checked against what a sermon is. A list that cannot be
 * read, or is not what was asked for, is an empty one: the page still
 * renders, and still links to the channel.
 */
export const useSermons = () => {
  return useAsyncData("sermons", () =>
    $fetch("/api/sermons")
      .then((data) => sermons.parse(data))
      .catch((): Sermon[] => []),
  );
};

/**
 * The newest sermons, as many as asked: the three that close the home page,
 * where the sermons page has the rest. None when none can be read.
 */
export const useRecentSermons = async (
  count = 3,
): Promise<ComputedRef<Sermon[]>> => {
  const { data } = await useSermons();

  return computed(() => data.value?.slice(0, count) ?? []);
};
