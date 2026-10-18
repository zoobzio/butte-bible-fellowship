import { z } from "zod";

import { churchEvent } from "./event";
import { staffMember } from "./staff";

/** The words and picture a page opens with, over its body. */
export const hero = z
  .object({
    tagline: z.string().meta({ examples: ["Welcome"] }),
    highlight: z.string().optional(),
    description: z.string().optional(),
    image: z
      .string()
      .optional()
      .meta({
        description: "The path of its picture, under the site's media.",
        examples: ["/hero/home.jpg"],
      }),
    cta: z
      .object({
        label: z.string().meta({ examples: ["Visit"] }),
        to: z.string().meta({ examples: ["/connect"] }),
      })
      .optional()
      .meta({
        description:
          "A call to action: what its button says, and where it goes.",
      }),
  })
  .meta({
    id: "Hero",
    description: "The words and picture a page opens with, over its body.",
  });

/**
 * A page's front matter: what every page carries — its title, and the
 * description search engines show — and the fields the site's pages write,
 * each optional, as one page uses some and another none.
 */
export const page = z
  .object({
    title: z.string().meta({ examples: ["Events"] }),
    description: z.string().optional().meta({
      description: "What search engines show for the page.",
    }),
    hero: hero.optional(),
    events: z.array(churchEvent).optional().meta({
      description: "The events page's calendar.",
    }),
    image: z.string().optional().meta({
      description:
        "An event's own page, /events/<slug>: the picture over its words.",
    }),
    staff: z.array(staffMember).optional().meta({
      description: "The contact page's staff.",
    }),
  })
  .meta({
    id: "Page",
    description:
      "A page's front matter: its title and description, and what the site's pages add.",
  });
