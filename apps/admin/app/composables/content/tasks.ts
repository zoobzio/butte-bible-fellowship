import type { ContentRecord } from "@bbf/schema/types";
import type { Ref, UseBrowser } from "#imports";

import type { ContentTasks } from "~/types/content";

import { computed, ref, useNuxtApp, useState, watch } from "#imports";
import { useApi } from "~/composables/api";
import { endpoint } from "~/composables/content/routes";
import { failure, isNotFound } from "~/utils/errors";
import { isUnder, parentOf, samePath } from "~/utils/folders";

/**
 * What the browser's rows have asked for and the content page has yet to
 * carry out. A row's action is wired where the browser is created, outside
 * any page, so it leaves its request here, under the app's own state, for
 * the page to find.
 */
export const useContentRequests = (): Ref<ContentTasks> =>
  useState<ContentTasks>("content:tasks", () => ({
    renaming: null,
    removing: null,
    removingSelected: null,
    held: null,
  }));

/**
 * What the content page carries out on the folder that is open, for the
 * browser given. `here` is that folder, by its path, the top's being of
 * no steps. `renaming` is the
 * folder a rename was asked for, for the page to draw its form over, and
 * `renamed` ends it. `held` is what a move picked up: `drop` puts it down
 * in the open folder, `release` lets it go where it was, and `droppable`
 * says whether here is somewhere else to put it. A folder asked to be
 * removed is asked about by name first, then removed. Each is written at
 * its own path: what the open folder holds, under the folder's. The documents and
 * folders selected, asked to be removed together, are asked about by their
 * count first, then removed, each on its own, so one that fails keeps none
 * of the rest: one already gone counts as removed, and only the ones that
 * could not be removed stay selected, as the folder listed afresh still
 * holds them. Each lists the folder afresh once done; what fails reports
 * through `error`, which the next try clears, and `busy` holds while one
 * is under way.
 */
export const useContentTasks = (
  browser: ReturnType<UseBrowser<ContentRecord>>,
) => {
  const api = useApi();
  const { $t } = useNuxtApp();
  const requests = useContentRequests();

  const busy = ref(false);
  const error = ref<string | null>(null);

  const here = computed(() => browser.pathKeys);
  const renaming = computed(() => requests.value.renaming);
  const held = computed(() => requests.value.held);

  const run = async (work: () => Promise<void>) => {
    if (busy.value) return;
    error.value = null;
    busy.value = true;
    try {
      await work();
      await browser.fetch();
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      busy.value = false;
    }
  };

  /*
   * A folder is never put down in itself, nor in a folder under it, and
   * nothing where it already is.
   */
  const droppable = computed(() => {
    const item = held.value;
    if (item === null) return false;
    if (item.kind === "folder" && isUnder(here.value, item.path)) return false;
    return !samePath(parentOf(item.path), here.value);
  });

  const drop = () =>
    run(async () => {
      const item = held.value;
      if (item === null) return;
      await api(endpoint(item.path), {
        method: "PATCH",
        body: { parent: here.value },
      });
      requests.value.held = null;
    });

  const release = () => {
    requests.value.held = null;
  };

  const renamed = async () => {
    requests.value.renaming = null;
    await browser.fetch();
  };

  const cancel = () => {
    requests.value.renaming = null;
  };

  watch(
    () => requests.value.removing,
    (asked) => {
      if (asked === null) return;
      requests.value.removing = null;
      if (!globalThis.confirm($t.admin.editor.confirm({ name: asked.label }))) {
        return;
      }
      run(async () => {
        await api(endpoint([...here.value, asked.key]), { method: "DELETE" });
      });
    },
    { immediate: true },
  );

  watch(
    () => requests.value.removingSelected,
    (asked) => {
      if (asked === null) return;
      requests.value.removingSelected = null;
      const count = asked.documents.length + asked.folders.length;
      if (count === 0) return;
      if (!globalThis.confirm($t.admin.content.confirmMany({ count }))) return;
      run(async () => {
        const results = await Promise.allSettled(
          [...asked.documents, ...asked.folders].map((step) =>
            api(endpoint([...here.value, step]), { method: "DELETE" }),
          ),
        );
        const failed = results.find(
          (result) =>
            result.status === "rejected" && !isNotFound(result.reason),
        );
        if (failed?.status === "rejected") {
          error.value = failure(failed.reason) ?? $t.admin.editor.failed();
        }
      });
    },
    { immediate: true },
  );

  return {
    here,
    busy,
    error,
    renaming,
    renamed,
    cancel,
    held,
    droppable,
    drop,
    release,
  };
};
