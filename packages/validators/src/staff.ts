import { z } from "zod";

/** Someone who serves the church, as the contact page's front matter lists them. */
export const staffMember = z.object({
  name: z.string(),
  /** What they do: `Elder`, `Pastor`, `Office Administrator`. */
  role: z.string(),
  /** A few words about them. */
  bio: z.string().optional(),
  /** The path of their photo, under the site's media. */
  photo: z.string().optional(),
  email: z.email().optional(),
});
