import type { StaffBody } from "@bbf/schema/types";

import type { StaffArguments } from "../types";

export const toStaffArguments = (body: StaffBody): StaffArguments => ({
  slug: body.slug,
  name: body.name,
  role: body.role,
  summary: body.summary ?? null,
  bio: body.bio ?? null,
  photo: body.photo ?? null,
  email: body.email ?? null,
  phone: body.phone ?? null,
  position: body.position,
  status: body.status,
});
