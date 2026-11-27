import { defineEventHandler } from "h3";

import { useSermons } from "~~/server/composables/sermons";
import { useYoutube } from "~~/server/composables/youtube";

/**
 * The sermons, synced with the church's YouTube channel: one added, and
 * published, for each recording its feed lists that the sermons do not
 * hold.
 */
export default defineEventHandler(async (event) =>
  useSermons().sync(await useYoutube(event).videos()),
);
