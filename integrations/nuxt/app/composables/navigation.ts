import type { ComputedRef, Ref } from "vue";

import type { NavigationItem } from "#layers/bbf/app/types/navigation";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  useAppConfig,
  useNuxtApp,
  useRoute,
} from "#imports";
import { isWithin } from "#layers/bbf/app/utils/navigation";

/**
 * The header as the app configures it, in the reader's words: the way
 * home, the line under the church's name, and each link, the one whose
 * page is being read marked.
 */
export const useNavigation = (): {
  home: string;
  tagline: ComputedRef<string>;
  links: ComputedRef<NavigationItem[]>;
} => {
  const { header } = useAppConfig();
  const { $t } = useNuxtApp();
  const route = useRoute();

  const home = "/";

  const tagline = computed(() => $t(header.tagline));

  const links = computed(() =>
    header.links.map((link) => ({
      label: $t(link.label),
      to: link.to,
      active: isWithin(route.path, link.to),
    })),
  );

  return { home, tagline, links };
};

/**
 * Publishes the header's height to the root as `--header-height`, so what
 * sticks under it, or scrolls to a heading, can leave it room.
 */
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
