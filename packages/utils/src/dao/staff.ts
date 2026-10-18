import type { StaffBody } from "@bbf/schema/types";

import type { StaffArguments } from "../types";

/**
 * What writing a staff member takes, from the body a request carries. A
 * field the body leaves out is written as null. For `admin.staff.update`,
 * spread it with the `id` of the member it replaces.
 */
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
