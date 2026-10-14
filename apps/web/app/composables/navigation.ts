import type { ComputedRef, Ref } from "vue";

import type { NavigationItem } from "~/types/navigation";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  useAppConfig,
  useNuxtApp,
  useRouter,
} from "#imports";
import { useRouteLocale } from "~/composables/locale";
import { isWithin, parentPath } from "~/utils/navigation";

/**
 * The site's navigation, in the route's locale: the way home, and the
 * configured links in their order, each in the reader's words and marked
 * when the page being read is its own or one under it.
 */
export const useNavigation = (): {
  home: ComputedRef<string>;
  links: ComputedRef<NavigationItem[]>;
} => {
  const { header } = useAppConfig();
  const { $t } = useNuxtApp();
  const { path, localize } = useRouteLocale();

  const home = computed(() => localize("/"));

  const links = computed(() =>
    header.links.map((link) => ({
      label: $t(link.label),
      to: localize(link.to),
      active: isWithin(path.value, link.to),
    })),
  );

  return { home, links };
};

/**
 * The way back from a page: `up` is the page this one is under, in the
 * route's locale — where a link leads when no page of the site brought the
 * reader here. `leave` steps back to the page that did, as the browser's
 * own button would, so that page is found as it was left; with none, it
 * goes up.
 */
export const usePageBack = () => {
  const router = useRouter();
  const { path, localize } = useRouteLocale();

  const up = computed(() => localize(parentPath(path.value)));

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
