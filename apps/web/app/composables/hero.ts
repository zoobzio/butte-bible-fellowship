import type { HomeHero } from "@bbf/schema/types";

import { computed, useAppConfig } from "#imports";
import { headingParts } from "~/utils/hero";

/**
 * The picture the home page's hero shows: the one uploaded for it in the
 * admin, or the site's own picture of the church while there is none.
 */
export const useHeroImage = (hero: () => HomeHero) => {
  const config = useAppConfig();
  return computed(() => hero().image ?? config.hero.image);
};

/**
 * The hero's heading as the parts it is drawn in: what the admin wrote
 * between asterisks is the highlight.
 */
export const useHeroHeading = (hero: () => HomeHero) =>
  computed(() => headingParts(hero().heading));
