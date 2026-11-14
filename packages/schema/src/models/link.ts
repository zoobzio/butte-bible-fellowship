import { z } from "zod";

export const link = z
  .string()
  .regex(
    /^(?:\/|https?:\/\/)\S*$/,
    "a link: a path of the site, or a web address",
  )
  .meta({
    description:
      "Where a link leads, or where a picture is kept: a path of the site, from its root, or a web address in full.",
    examples: ["/about-us", "https://example.com/church.jpg"],
  });
