import type { HomeBody } from "@bbf/schema/types";

import type { HomeArguments } from "../types";

export const toHomeArguments = (body: HomeBody): HomeArguments => ({
  title: body.title,
  description: body.description ?? null,
  hero_heading: body.heroHeading,
  hero_description: body.heroDescription,
  hero_action: body.heroAction,
  hero_link: body.heroLink,
});
