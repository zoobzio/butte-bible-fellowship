/** Whether a path is a section's own page, or a page under it. */
export const isWithin = (path: string, section: string): boolean =>
  path === section || path.startsWith(`${section}/`);
