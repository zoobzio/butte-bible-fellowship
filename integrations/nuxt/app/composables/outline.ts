import type { Root } from "hast";
import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import type { OutlineEntry } from "#layers/bbf/app/types/outline";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  toValue,
  watch,
} from "#imports";
import { useFrame } from "#layers/bbf/app/composables/motion";
import { outline, sectionsOnScreen } from "#layers/bbf/app/utils/outline";

/** The outline of a tree, which follows it: nothing for none. */
export const useOutline = (
  tree: MaybeRefOrGetter<Root | null | undefined>,
): ComputedRef<OutlineEntry[]> =>
  computed(() => {
    const body = toValue(tree);
    return body ? outline(body) : [];
  });

const headerHeight = () =>
  document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;

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
