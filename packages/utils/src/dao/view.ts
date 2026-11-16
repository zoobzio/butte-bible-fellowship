import type { ViewBody, ViewPath } from "@bbf/schema/types";

import type { ViewArguments } from "../types";

/**
 * A save of a view: whose it is, by the `sub` their session names them
 * with, the list it is of and its id, as the address has them, and its
 * name and payload, as its list's schema left them.
 */
export const toViewArguments = (
  sub: string,
  path: ViewPath,
  body: ViewBody,
): ViewArguments => ({
  sub,
  surface: path.surface,
  id: path.id,
  name: body.name,
  payload: body.payload,
});
