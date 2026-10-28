import type { Scope } from "@bbf/patents";

import { isScope } from "@bbf/patents";

export const requiredScope = (
  pathname: string,
  method: string,
): Scope | undefined => {
  const [, api, records] = pathname.split("/");
  if (api !== "api" || records === undefined) {
    return undefined;
  }
  const action = method === "GET" || method === "HEAD" ? "read" : "write";
  const scope = `${records}:${action}`;
  return isScope(scope) ? scope : undefined;
};
