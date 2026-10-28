import type { ComputedRef } from "vue";

import type { Sermon } from "@bbf/schema/types";

import { sermons } from "@bbf/schema";

import { computed, useAsyncData } from "#imports";

export const useSermons = () => {
  return useAsyncData("sermons", () =>
    $fetch("/api/sermons")
      .then((data) => sermons.parse(data))
      .catch((): Sermon[] => []),
  );
};

export const useRecentSermons = async (
  count = 3,
): Promise<ComputedRef<Sermon[]>> => {
  const { data } = await useSermons();

  return computed(() => data.value?.slice(0, count) ?? []);
};

export const useSermonImage = () => {
  return (sermon: Sermon): string | undefined =>
    sermon.image ??
    (sermon.video === undefined
      ? undefined
      : `https://i.ytimg.com/vi/${sermon.video}/hqdefault.jpg`);
};
