import { z } from "zod";

/** Someone who serves the church, as the contact page lists them. */
export const staffMember = z
  .object({
    name: z.string().meta({ examples: ["Jane Doe"] }),
    role: z.string().meta({
      description: "What they do.",
      examples: ["Elder", "Pastor", "Office Administrator"],
    }),
    bio: z.string().optional().meta({
      description: "A few words about them.",
    }),
    photo: z
      .string()
      .optional()
      .meta({
        description: "The path of their photo, under the site's media.",
        examples: ["/staff/jane-doe.jpg"],
      }),
    email: z.email().optional(),
  })
  .meta({
    id: "StaffMember",
    description:
      "Someone who serves the church, as the contact page lists them.",
  });
