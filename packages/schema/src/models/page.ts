import { z } from "zod";

export const page = z
  .object({
    title: z.string().meta({ examples: ["Events"] }),
    description: z.string().optional().meta({
      description: "What search engines show for the page.",
    }),
    image: z.string().optional().meta({
      description:
        "An event's own page, /events/<slug>: the picture over its words.",
    }),
  })
  .meta({
    id: "Page",
    description:
      "A page's front matter: its title and description, and the picture an event's own page adds.",
  });
