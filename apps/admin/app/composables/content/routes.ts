/** The admin's API for the content, which a path is asked of. */
export const ROUTE = "/api/content";

/**
 * Where something of the content is read and written: its path under the
 * API's own route, each name encoded as a step of it. The top is the path
 * of no steps.
 */
export const endpoint = (path: readonly string[] = []): string =>
  [ROUTE, ...path.map((step) => encodeURIComponent(step))].join("/");
