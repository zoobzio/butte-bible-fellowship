import { z } from "zod";

import { documentSize } from "./content";

export const folderRecord = z
  .object({
    id: z
      .int()
      .positive()
      .meta({
        description: "What names it to the admin: its row's number.",
        examples: [1],
      }),
    parent: z
      .int()
      .positive()
      .optional()
      .meta({
        description:
          "The folder it is inside, by its id. Left out, it is at the top.",
        examples: [1],
      }),
    name: z.string().meta({ examples: ["Sermon notes"] }),
    count: z
      .int()
      .min(0)
      .meta({
        description:
          "How many folders and pages it holds itself, what those hold not counted.",
        examples: [3],
      }),
    size: documentSize.meta({
      description:
        "How much all that is under it holds, in bytes: every document filed in it or in a folder under it, however deep.",
    }),
    createdAt: z.iso.datetime().meta({
      description: "When its row was written.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
    updatedAt: z.iso.datetime().meta({
      description:
        "When it, or anything under it, was last changed: a document or a folder written, moved in or out, or removed, however deep.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "FolderRecord",
    description:
      "A folder of the content, as the admin reads it: its row, how many folders and pages it holds itself, and what all that is under it comes to.",
  });

export const folderRecords = z.array(folderRecord).meta({
  id: "FolderRecords",
  description:
    "The folders inside one, or at the top, as the admin lists them: by name.",
});
