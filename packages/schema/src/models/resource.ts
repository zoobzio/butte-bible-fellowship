import { z } from "zod";

import { contentRecord, contentRecords } from "./content";
import { folderRecord, folderRecords } from "./folder";
import { mark } from "./listing";

export const contentResource = z
  .discriminatedUnion("kind", [
    z.object({
      kind: z.literal("folder"),
      folder: folderRecord.optional().meta({
        description: "The folder itself. Left out, it is the top.",
      }),
      folders: folderRecords.meta({
        description: "The folders inside it, which the search leaves.",
      }),
      files: contentRecords.meta({
        description: "The documents filed in it, which the search leaves.",
      }),
      since: mark,
    }),
    z.object({
      kind: z.literal("document"),
      record: contentRecord,
    }),
  ])
  .meta({
    id: "ContentResource",
    description:
      "What a path of the content names: a folder, with the folders inside it and the documents filed in it, or a document.",
  });
