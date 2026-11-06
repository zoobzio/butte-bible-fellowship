import type { PageLink } from "~/types/navigation";

import { computed, defineTabs, useRoute } from "#imports";
import { isWithin } from "#layers/bbf/app/utils/navigation";

/**
 * The tabs of a page's header: each a link to one page of the record, the
 * one being read marked, or a page under it. Nothing given, nothing shown.
 */
export const usePageTabs = (pages: () => PageLink[] | undefined) => {
  const route = useRoute();

  const active = computed(
    () => pages()?.find((page) => isWithin(route.path, page.to))?.to,
  );

  return defineTabs(() => ({
    tabs: (pages() ?? []).map((page) => ({
      value: page.to,
      label: page.label,
      icon: page.icon,
      link: { to: page.to },
    })),
    modelValue: active.value,
  }));
};
