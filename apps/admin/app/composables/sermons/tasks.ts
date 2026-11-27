import type { SermonRecord } from "@bbf/schema/types";

import type { TimelineService } from "~/types/timeline";

import { sermonSync } from "@bbf/schema";
import { ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { SYNC } from "~/composables/sermons/routes";
import { failure } from "~/utils/errors";

/**
 * What the sermons page carries out, for the timeline given: a sync with
 * the church's YouTube channel. One at a time: `syncing` holds while a
 * sync is under way. What it came to is left in `notice`, and what fails
 * in `error`, each cleared by the next try.
 */
export const useSermonTasks = (timeline: TimelineService<SermonRecord>) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const syncing = ref(false);
  const notice = ref<string | null>(null);
  const error = ref<string | null>(null);

  /**
   * Asks the API to sync, then reads the sermons afresh where any were
   * added, so the new ones lead the timeline.
   */
  const sync = async () => {
    if (syncing.value) return;
    notice.value = null;
    error.value = null;
    syncing.value = true;
    try {
      const { added } = sermonSync.parse(await api(SYNC, { method: "POST" }));
      if (added > 0) await timeline.fetch();
      notice.value =
        added > 0
          ? $t.admin.sermons.added({ count: added })
          : $t.admin.sermons.current();
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      syncing.value = false;
    }
  };

  return { syncing, notice, error, sync };
};
