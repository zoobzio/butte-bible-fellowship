import { appearance } from "@bbf/schema";

import { useAppearance } from "#layers/bbf/app/composables/appearance";

/**
 * How the site looks, as whoever runs it set it in the admin: read from
 * the site's API and laid over the theme the app is built with. A read
 * that fails changes nothing: the site looks as its theme says, which is
 * what it looks like with nothing set.
 */
export const useSiteAppearance = () => {
  const { adopt } = useAppearance();

  const load = async () => {
    const stored = await $fetch("/api/appearance")
      .then((data) => appearance.parse(data))
      .catch(() => null);
    if (stored !== null) adopt(stored);
  };

  return { load };
};
