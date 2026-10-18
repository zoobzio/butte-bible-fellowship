import { z } from "zod";

/**
 * What names a thing in an address: `/events/<slug>`, `/staff/<slug>`.
 * Lowercase words and digits, joined by single hyphens, as a translation
 * never changes it.
 */
export const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "a slug: lowercase words joined by hyphens",
  )
  .meta({
    description:
      "What names it in an address: lowercase words and digits, joined by single hyphens.",
    examples: ["worship-service"],
  });
