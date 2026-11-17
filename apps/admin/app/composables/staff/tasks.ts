import type { StaffRecord } from "@bbf/schema/types";
import type { Ref } from "#imports";

import type { TableService } from "~/types/listing";
import type { StaffTasks } from "~/types/staff";

import { ref, useNuxtApp, useState, watch } from "#imports";
import { useApi } from "~/composables/api";
import { endpoint } from "~/composables/staff/routes";
import { failure, isNotFound } from "~/utils/errors";

/**
 * What the table's selection has asked for and the staff page has yet to
 * carry out. A bulk action is wired where the table is created, outside
 * any page, so it leaves its request here, under the app's own state, for
 * the page to find.
 */
export const useStaffRequests = (): Ref<StaffTasks> =>
  useState<StaffTasks>("staff:tasks", () => ({ removing: null }));

/**
 * What the staff page carries out on the members selected, for the table
 * given. The members asked to be removed are asked about by their count
 * first, then removed, each on their own, so one that fails keeps none of
 * the rest. One already gone counts as removed. The table lists afresh
 * once done, from its last page if the one it was on is no longer there,
 * and only the members that could not be removed stay selected; what
 * fails reports through `error`, which the next try clears, and `busy`
 * holds while a removal is under way.
 */
export const useStaffTasks = (table: TableService<StaffRecord>) => {
  const api = useApi();
  const { $t } = useNuxtApp();
  const requests = useStaffRequests();

  const busy = ref(false);
  const error = ref<string | null>(null);

  const remove = async (ids: string[]) => {
    if (busy.value) return;
    error.value = null;
    busy.value = true;
    try {
      const results = await Promise.allSettled(
        ids.map((id) => api(endpoint(Number(id)), { method: "DELETE" })),
      );
      const failed = results.flatMap((result, index) =>
        result.status === "rejected" && !isNotFound(result.reason)
          ? [{ id: ids[index]!, reason: result.reason as unknown }]
          : [],
      );
      table.table.setRowSelection(
        Object.fromEntries(failed.map(({ id }) => [id, true])),
      );
      if (failed[0]) {
        error.value = failure(failed[0].reason) ?? $t.admin.editor.failed();
      }
      await table.fetch();
      // The page the table was on went with its members: back to the last.
      if (table.data.length === 0 && table.rowCount > 0) {
        table.table.setPageIndex(table.table.getPageCount() - 1);
      }
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      busy.value = false;
    }
  };

  watch(
    () => requests.value.removing,
    (asked) => {
      if (asked === null) return;
      requests.value.removing = null;
      if (asked.length === 0) return;
      if (
        !globalThis.confirm($t.admin.staff.confirmMany({ count: asked.length }))
      ) {
        return;
      }
      remove(asked);
    },
    { immediate: true },
  );

  return { busy, error };
};
