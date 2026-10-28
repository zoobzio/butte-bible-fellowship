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

/**
 * The site's navigation: the way home, and the configured links in their
 * order, each in the reader's words and marked when the page being read is
 * its own or one under it.
 */
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

/**
 * The way back from a page: `up` is the page this one is under — where a
 * link leads when no page of the site brought the reader here. `leave`
 * steps back to the page that did, as the browser's own button would, so
 * that page is found as it was left; with none, it goes up.
 */
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

/**
 * Publishes an element's height to the root as `--header-height` while it
 * is mounted, measured again whenever it resizes: what sticks under the
 * header reads where it ends. The property is removed on unmount.
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
