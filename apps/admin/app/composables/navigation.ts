import type { PageLink } from "~/types/navigation";

import {
  computed,
  defineTabs,
  useAppConfig,
  useNuxtApp,
  useRoute,
} from "#imports";
import { isWithin } from "~/utils/navigation";

export const useSidebar = () => {
  const { sidebar } = useAppConfig();
  const { $t } = useNuxtApp();
  const route = useRoute();

  const active = computed(
    () => sidebar.links.find((link) => isWithin(route.path, link.to))?.to,
  );

  const tabs = defineTabs(() => ({
    tabs: sidebar.links.map((link) => ({
      value: link.to,
      label: $t(link.label),
      link: { to: link.to },
    })),
    modelValue: active.value,
    pt: { root: { orientation: "vertical" as const } },
  }));

  return { tabs };
};

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
