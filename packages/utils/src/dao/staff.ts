import type { StaffBody } from "@bbf/schema/types";

import type { StaffArguments } from "../types";

export const toStaffArguments = (body: StaffBody): StaffArguments => ({
  name: body.name,
  role: body.role,
  summary: body.summary ?? null,
  bio: body.bio ?? null,
  photo: body.photo ?? null,
  email: body.email ?? null,
  phone: body.phone ?? null,
  status: body.status,
});
