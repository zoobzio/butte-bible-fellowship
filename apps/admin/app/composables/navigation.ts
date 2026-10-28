import {
  computed,
  defineTabs,
  useAppConfig,
  useNuxtApp,
  useRoute,
} from "#imports";
import { isWithin } from "~/utils/navigation";

/**
 * The sidebar's sections, as tabs the route drives: one per configured
 * link, in the reader's words, each a real hyperlink to the route that
 * lists its records, and the one whose page is being read — or a page
 * under it, an editor's — marked as active. The tabs stand one under
 * another.
 */
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
