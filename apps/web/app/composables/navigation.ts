import { computed, useRoute, useRouter } from "#imports";
import { parentPath } from "~/utils/navigation";

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
