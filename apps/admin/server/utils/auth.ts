import type { Scope } from "@bbf/patents";

import { isScope } from "@bbf/patents";

/**
 * The scope an API request needs: `/api/<records>/…` reads with a `GET`
 * and writes with anything else. A path that names no records the
 * contract has needs a scope nobody holds.
 */
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
