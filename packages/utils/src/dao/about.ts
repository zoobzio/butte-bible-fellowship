import type { AboutBody } from "@bbf/schema/types";

import type { AboutArguments } from "../types";

export const toAboutArguments = (body: AboutBody): AboutArguments => ({
  title: body.title,
  description: body.description ?? null,
});
