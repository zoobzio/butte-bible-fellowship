import { z } from "zod";

/** A sermon on the church's YouTube channel, as its feed lists it. */
export const sermon = z
  .object({
    id: z
      .string()
      .min(1)
      .meta({
        description:
          "YouTube's id for the sermon: what its watch and embed URLs carry.",
        examples: ["dQw4w9WgXcQ"],
      }),
    title: z.string().meta({ examples: ["Faith & Works"] }),
    published: z.iso.datetime({ offset: true }).meta({
      description: "When it was published, as an ISO 8601 timestamp.",
      examples: ["2026-10-04T18:16:28+00:00"],
    }),
    thumbnail: z.url().meta({
      description: "The URL of its thumbnail image.",
      examples: ["https://i4.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"],
    }),
  })
  .meta({
    id: "Sermon",
    description:
      "A sermon on the church's YouTube channel, as its feed lists it.",
  });

/** The sermons the site's API lists, newest first. */
export const sermons = z.array(sermon).meta({
  description: "The sermons the site lists, newest first.",
});
