import type { ComputedRef, Ref } from "vue";

import type { NavigationItem } from "~/types/navigation";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  useAppConfig,
  useNuxtApp,
  useRoute,
  useRouter,
} from "#imports";
import { isWithin, parentPath } from "~/utils/navigation";

export const useNavigation = (): {
  home: string;
  links: ComputedRef<NavigationItem[]>;
} => {
  const { header } = useAppConfig();
  const { $t } = useNuxtApp();
  const route = useRoute();

  const home = "/";

  const links = computed(() =>
    header.links.map((link) => ({
      label: $t(link.label),
      to: link.to,
      active: isWithin(route.path, link.to),
    })),
  );

  return { home, links };
};

export const usePageBack = () => {
  const router = useRouter();
  const route = useRoute();

  const up = computed(() => parentPath(route.path));

  const leave = () => {
    if (router.options.history.state.back) {
      router.back();
    } else {
      router.push(up.value);
    }
  };

  return { up, leave };
};

export const useHeaderHeight = (
  element: Readonly<Ref<HTMLElement | null>>,
): void => {
  let observer: ResizeObserver | null = null;

  const publish = () => {
    if (!element.value) return;
    document.documentElement.style.setProperty(
      "--header-height",
      `${element.value.offsetHeight}px`,
    );
  };

  onMounted(() => {
    publish();
    if (!element.value) return;
    observer = new ResizeObserver(publish);
    observer.observe(element.value);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
    document.documentElement.style.removeProperty("--header-height");
  });
};
