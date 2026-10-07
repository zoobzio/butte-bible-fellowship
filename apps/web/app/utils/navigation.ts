/**
 * Whether a page is a section's own page or one under it: `/events` and
 * `/events/potluck` are both within `/events`. Only the home page is within
 * `/`.
 */
export const isWithin = (path: string, section: string): boolean => {
  return path === section || path.startsWith(`${section}/`);
};

/** The page a page is under: `/events` for `/events/potluck`, `/` at the top. */
export const parentPath = (path: string): string => {
  return path.slice(0, path.lastIndexOf("/")) || "/";
};
