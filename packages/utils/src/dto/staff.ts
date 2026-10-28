import type { StaffMember, StaffRecord } from "@bbf/schema/types";

import { toHast } from "./hast";
import type { StaffRecordRow, StaffRow } from "../types";

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
