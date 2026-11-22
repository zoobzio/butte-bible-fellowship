import type { PersonRecord, StaffMember } from "@bbf/schema/types";

import { hast } from "@bbf/schema";

import type { PersonRecordRow, StaffRow } from "../types";

export const toStaffMember = (row: StaffRow): StaffMember => ({
  id: row.id,
  name: row.name ?? "",
  role: row.role,
  title: row.title ?? undefined,
  summary: row.summary ?? undefined,
  bio: row.bio === null ? undefined : hast.parse(row.bio),
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
});

export const toPersonRecord = (row: PersonRecordRow): PersonRecord => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  name: row.name ?? "",
  role: row.role,
  title: row.title ?? undefined,
  summary: row.summary ?? undefined,
  bio: row.bio === null ? undefined : hast.parse(row.bio),
  photo: row.photo ?? undefined,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  address: row.address ?? undefined,
  birthday: row.birthday ?? undefined,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
