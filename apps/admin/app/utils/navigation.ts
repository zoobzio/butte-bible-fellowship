/** Whether a path is a page or one under it: `/staff/3` is within `/staff`. */
export const isWithin = (path: string, page: string): boolean =>
  path === page || path.startsWith(`${page}/`);
