import type { ConnectBody } from "@bbf/schema/types";

import type { ConnectArguments } from "../types";

export const toConnectArguments = (body: ConnectBody): ConnectArguments => ({
  title: body.title,
  description: body.description ?? null,
  address: body.address,
  phone: body.phone ?? null,
  fax: body.fax ?? null,
  email: body.email ?? null,
  hours: body.hours ?? null,
});
