import type { StaffMember, StaffRecord } from "@bbf/schema/types";

import { toHast } from "./hast";
import type { StaffRecordRow, StaffRow } from "../types";

/**
 * A staff member as the site lists them, from a row of the staff. A column
 * the row has null in, the member leaves out; the bio, written as Markdown,
 * goes out as the tree the app renders. An admin row's `id`, `position`,
 * `status` and timestamps order and keep them, and are not what the site
 * shows: the model carries none of them.
 */
export const toStaffMember = (row: StaffRow): StaffMember => ({
  slug: row.slug,
  name: row.name,
  role: row.role,
  summary: row.summary ?? undefined,
  bio: row.bio === null ? undefined : toHast(row.bio),
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
});

/**
 * A staff member as the admin reads them, from a row of the admin's
 * queries. A column the row has null in, the record leaves out; the bio
 * stays the Markdown it was written as, for an editor to show; the id,
 * position and status come along, and the timestamps as moments in UTC.
 */
export const toStaffRecord = (row: StaffRecordRow): StaffRecord => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  role: row.role,
  summary: row.summary ?? undefined,
  bio: row.bio ?? undefined,
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  position: row.position,
  status: row.status,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
