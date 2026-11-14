import type { FolderRecord } from "@bbf/schema/types";

import type { FolderRecordRow } from "../types";

export const toFolderRecord = (row: FolderRecordRow): FolderRecord => ({
  id: row.id,
  parent: row.parent_id ?? undefined,
  name: row.name,
  count: row.count,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
