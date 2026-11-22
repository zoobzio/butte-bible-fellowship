import type { PersonBody } from "@bbf/schema/types";

import type { PersonArguments } from "../types";

export const toPersonArguments = (body: PersonBody): PersonArguments => ({
  first_name: body.firstName,
  last_name: body.lastName,
  role: body.role,
  title: body.title ?? null,
  summary: body.summary ?? null,
  email: body.email ?? null,
  phone: body.phone ?? null,
  address: body.address ?? null,
  birthday: body.birthday ?? null,
});
