import { z } from "zod";

import { listingQuery, sorting } from "./listing";

export const folderId = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .meta({
      description: "What names it to the admin: its row's number.",
      examples: [1],
    }),
});

export const FOLDER_SORT_KEYS = [
  "name",
  "size",
  "createdAt",
  "updatedAt",
] as const;

export const folderSort = z.enum(FOLDER_SORT_KEYS).meta({
  description:
    "What a level's folders may be sorted by: the name, or what a folder shows under a column of the documents.",
  examples: ["name"],
});

export const foldersQuery = z.object({
  parent: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .meta({
      description:
        "The folder whose folders are listed, by its id. Left out, the folders at the top.",
      examples: [1],
    }),
  q: listingQuery.shape.q.meta({
    description:
      "Free text the folders' names are searched for, without regard to case. Left out or empty, every folder of the level.",
    examples: ["sermons"],
  }),
  ...sorting(folderSort),
});

export const folderBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .meta({
        description:
          "What the folder is called: its own among the folders beside it.",
        examples: ["Sermon notes"],
      }),
  })
  .meta({
    id: "FolderBody",
    description:
      "A folder as it is written: what renaming one replaces. Where it is, is written on its own.",
  });

export const folderPlacement = z
  .object({
    parent: z
      .int()
      .positive()
      .optional()
      .meta({
        description:
          "The folder it is inside, by its id. Left out, it is at the top.",
        examples: [1],
      }),
  })
  .meta({
    id: "FolderPlacement",
    description:
      "Where a folder is, on its own: what moving it into another takes.",
  });

export const folderDraft = folderBody.extend(folderPlacement.shape).meta({
  id: "FolderDraft",
  description: "A new folder as it is written: its name, and where it is made.",
});
