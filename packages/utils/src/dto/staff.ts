import type { StaffMember } from "@bbf/schema/types";

import type { StaffRow } from "../types";

/**
 * A staff member as the contact page lists them, from a row of the staff.
 * The row's `slug` and `position` order and address them, and are not what
 * the page shows: the model carries neither.
 */
export const toStaffMember = (row: StaffRow): StaffMember => ({
  name: row.name,
  role: row.role,
  bio: row.bio ?? undefined,
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
});
