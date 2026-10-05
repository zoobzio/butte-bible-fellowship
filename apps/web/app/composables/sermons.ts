import type { Sermon } from "#shared/types/sermons";

import { useAsyncData } from "#imports";

/**
 * The channel's latest sermons, newest first, from the site's own
 * `/api/sermons`. A list that cannot be read is an empty one: the page still
 * renders, and still links to the channel.
 */
export const useSermons = () => {
  return useAsyncData("sermons", () =>
    $fetch<Sermon[]>("/api/sermons").catch((): Sermon[] => []),
  );
};
