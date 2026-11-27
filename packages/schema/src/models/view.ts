import { z } from "zod";

/**
 * The lists of the admin a view may be saved over, each by the name its
 * views are kept under. A list has its views once it is named here and
 * its payload's schema is among `VIEW_PAYLOADS`.
 */
export const VIEW_SURFACES = [
  "people",
  "content",
  "events",
  "sermons",
] as const;

export const viewSurface = z.enum(VIEW_SURFACES).meta({
  id: "ViewSurface",
  description: "A list of the admin a view is saved over.",
  examples: ["people"],
});

export const viewRecord = z
  .object({
    id: z.uuid().meta({
      description:
        "What names it: a UUID whoever saved it made, before it was stored.",
      examples: ["0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f"],
    }),
    surface: z.string().meta({
      description: "The list it is a view of.",
      examples: ["people"],
    }),
    name: z.string().meta({ examples: ["Elders"] }),
    payload: z.unknown().meta({
      description:
        "The arrangement it holds, as it was stored. It was checked against its list's schema when it was saved, and is not held to it here: one saved before the list changed still reads, for whoever reads it to set aside.",
    }),
    createdAt: z.iso.datetime().meta({
      description: "When it was first saved.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
    updatedAt: z.iso.datetime().meta({
      description: "When it was last saved.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "ViewRecord",
    description:
      "A saved view, as the admin reads it: a named arrangement of one of its lists, the signed-in user's own.",
  });

export const viewRecords = z.array(viewRecord).meta({
  id: "ViewRecords",
  description:
    "The signed-in user's views of one list, in the order they were saved.",
});
