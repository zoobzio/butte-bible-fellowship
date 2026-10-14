import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import type { OutlineEntry } from "~/types/outline";
import type { PageItem } from "~/types/page";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  toValue,
  watch,
} from "#imports";
import { useFrame } from "~/composables/motion";
import { outline, sectionsOnScreen } from "~/utils/outline";

/**
 * A page's outline, for its table of contents: its headings, in the order
 * it sets them, read from its body. A page that is not there has none.
 */
export const useOutline = (
  page: MaybeRefOrGetter<Pick<PageItem, "body"> | null | undefined>,
): ComputedRef<OutlineEntry[]> =>
  computed(() => {
    const item = toValue(page);
    return item ? outline(item.body) : [];
  });

/** How much of the viewport's top the sticky header covers. */
const headerHeight = () =>
  document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;

/**
 * The ids of the outline's entries whose sections are on screen, in the
 * outline's order: read on mount, then at most once per frame as the window
 * scrolls or resizes. What the site's header covers is not on screen. An
 * entry whose heading is not in the document is passed over. Listeners are
 * torn down on unmount.
 */
export const useOutlineSpy = (
  entries: MaybeRefOrGetter<OutlineEntry[]>,
): Readonly<Ref<readonly string[]>> => {
  const active = ref<string[]>([]);

  const refresh = () => {
    const headings = toValue(entries).flatMap(({ id }) => {
      const heading = document.getElementById(id);
      return heading ? [{ id, top: heading.getBoundingClientRect().top }] : [];
    });

    const next = sectionsOnScreen(
      headings.map(({ top }) => top),
      headerHeight(),
      window.innerHeight,
    ).map((index) => headings[index]!.id);

    // The same sections as before are the same array: nothing re-renders.
    if (
      next.length !== active.value.length ||
      next.some((id, index) => id !== active.value[index])
    ) {
      active.value = next;
    }
  };

  const { schedule } = useFrame(refresh);

  watch(() => toValue(entries), schedule);

  onMounted(() => {
    refresh();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  });

  return readonly(active);
};
