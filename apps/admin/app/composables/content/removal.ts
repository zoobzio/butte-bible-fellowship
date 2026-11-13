import type { ContentRecord } from "@bbf/schema/types";

import { ref, useNuxtApp, useRouter } from "#imports";
import { useApi } from "~/composables/api";
import { BACK, endpoint } from "~/composables/content/routes";
import { failure } from "~/utils/errors";

/**
 * The deletion of a page of the site, from its page's menu: asked by title
 * first, and back to the list once done. What fails reports through
 * `error`, which the next try clears.
 */
export const useContentRemoval = (record: ContentRecord) => {
  const api = useApi();
  const router = useRouter();
  const { $t } = useNuxtApp();

  const removing = ref(false);
  const error = ref<string | null>(null);

  const destroy = async () => {
    if (removing.value) return;
    if (!globalThis.confirm($t.admin.editor.confirm({ name: record.title }))) {
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
