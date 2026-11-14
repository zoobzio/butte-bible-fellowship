import type { FolderDraft } from "@bbf/schema/types";

import type { FolderArguments } from "../types";

/** A new folder: its name, and the folder it is made in, null for none. */
export const toFolderArguments = (draft: FolderDraft): FolderArguments => ({
  name: draft.name,
  parent_id: draft.parent ?? null,
});
