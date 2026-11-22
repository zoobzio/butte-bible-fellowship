import type { PersonRecord } from "@bbf/schema/types";

import { ref, useNuxtApp, useRouter } from "#imports";
import { useApi } from "~/composables/api";
import { BACK, endpoint } from "~/composables/people/routes";
import { failure } from "~/utils/errors";

/**
 * The deletion of a person, from their page's menu: asked by name first,
 * and back to the list once done. What fails reports through `error`,
 * which the next try clears.
 */
export const usePersonRemoval = (record: PersonRecord) => {
  const api = useApi();
  const router = useRouter();
  const { $t } = useNuxtApp();

  const removing = ref(false);
  const error = ref<string | null>(null);

  const destroy = async () => {
    if (removing.value) return;
    if (!globalThis.confirm($t.admin.editor.confirm({ name: record.name }))) {
      return;
    }
    error.value = null;
    removing.value = true;
    try {
      await api(endpoint(record.id), { method: "DELETE" });
      await router.push(BACK);
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      removing.value = false;
    }
  };

  return { removing, error, destroy };
};
