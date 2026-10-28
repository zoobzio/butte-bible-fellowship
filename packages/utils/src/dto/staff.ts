import type { StaffMember, StaffRecord } from "@bbf/schema/types";

import { hast } from "@bbf/schema";

import type { StaffRecordRow, StaffRow } from "../types";

export const toStaffMember = (row: StaffRow): StaffMember => ({
  id: row.id,
  name: row.name,
  role: row.role,
  summary: row.summary ?? undefined,
  bio: row.bio === null ? undefined : hast.parse(row.bio),
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
});

export const toStaffRecord = (row: StaffRecordRow): StaffRecord => ({
  id: row.id,
  name: row.name,
  role: row.role,
  summary: row.summary ?? undefined,
  bio: row.bio === null ? undefined : hast.parse(row.bio),
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  status: row.status,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
