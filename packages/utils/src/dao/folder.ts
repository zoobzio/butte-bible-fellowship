import type { FolderBody } from "@bbf/schema/types";

import type { FolderArguments } from "../types";

/** A new folder: its name, and the folder it is made in, null for none. */
export const toFolderArguments = (
  body: FolderBody,
  parent?: number,
): FolderArguments => ({
  name: body.name,
  parent_id: parent ?? null,
});
