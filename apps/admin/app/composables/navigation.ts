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
