import type { Ref } from "vue";

import { onMounted, useState } from "#imports";
import { churchDate } from "~/utils/events";

/**
 * Today's date at the church, as `YYYY-MM-DD`. It is the server's until the
 * page is in a browser: a page rendered ahead of time says what day it was
 * then, and is put right once mounted. Everything that asks shares the one.
 */
export const useToday = (): Ref<string> => {
  const today = useState("events:today", () => churchDate(new Date()));

  onMounted(() => {
    today.value = churchDate(new Date());
  });

  return today;
};
