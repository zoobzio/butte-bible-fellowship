import { z } from "zod";

import { isStep } from "../models/path";

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

export const folderBody = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .refine((name) => isStep(name), {
        error: "a name without / \\ ? # or %, and not . or ..",
      })
      .meta({
        description:
          "What the folder is called, and what names it in its path: its own among the folders and documents beside it, without a slash, a backslash, a question mark, a hash or a percent sign, and neither . nor ..",
        examples: ["Sermon notes"],
      }),
  })
  .meta({
    id: "FolderBody",
    description:
      "A folder as it is written: what renaming one replaces. Where it is, is written on its own.",
  });
