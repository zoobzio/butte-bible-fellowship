import { z } from "zod";

import { churchEvent } from "./events";
import { staffMember } from "./staff";

/** The words and picture a page opens with, over its body. */
export const hero = z.object({
  tagline: z.string(),
  highlight: z.string().optional(),
  description: z.string().optional(),
  /** The path of its picture, under the site's media. */
  image: z.string().optional(),
  /** A call to action: what its button says, and where it goes. */
  cta: z
    .object({
      label: z.string(),
      to: z.string(),
    })
    .optional(),
});

/**
 * A page's front matter, beyond what every page carries: the fields the
 * site's pages write, each optional, as one page uses some and another none.
 */
export const page = z.object({
  hero: hero.optional(),
  /** The events page's calendar. */
  events: z.array(churchEvent).optional(),
  /** An event's own page, `/events/<slug>`: the picture over its words. */
  image: z.string().optional(),
  /** The contact page's staff. */
  staff: z.array(staffMember).optional(),
});
