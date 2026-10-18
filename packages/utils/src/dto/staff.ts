import type { StaffMember } from "@bbf/schema/types";

import type { StaffRow } from "../types";

/**
 * A staff member as the site lists them, from a row of the staff. A column
 * the row has null in, the member leaves out. An admin row's `id`,
 * `position`, `status` and timestamps order and keep them, and are not what
 * the site shows: the model carries none of them.
 */
export const toStaffMember = (row: StaffRow): StaffMember => ({
  slug: row.slug,
  name: row.name,
  role: row.role,
  summary: row.summary ?? undefined,
  bio: row.bio ?? undefined,
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
});
