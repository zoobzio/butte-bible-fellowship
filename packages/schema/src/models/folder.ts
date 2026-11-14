import { z } from "zod";

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
    createdAt: z.iso.datetime().meta({
      description: "When its row was written.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
    updatedAt: z.iso.datetime().meta({
      description: "When its row was last changed.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "FolderRecord",
    description:
      "A folder of the content, as the admin reads it: every column of its row, and how much it holds.",
  });

export const folderRecords = z.array(folderRecord).meta({
  id: "FolderRecords",
  description:
    "The folders inside one, or at the top, as the admin lists them: by name.",
});
