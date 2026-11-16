import type { ViewRecord } from "@bbf/schema/types";

import type { ViewRecordRow } from "../types";

/** A saved view as the admin reads it: its payload as it was stored. */
export const toViewRecord = (row: ViewRecordRow): ViewRecord => ({
  id: row.id,
  surface: row.surface,
  name: row.name,
  payload: row.payload,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
