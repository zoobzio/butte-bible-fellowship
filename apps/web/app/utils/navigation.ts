export const isWithin = (path: string, section: string): boolean => {
  return path === section || path.startsWith(`${section}/`);
};

export const parentPath = (path: string): string => {
  return path.slice(0, path.lastIndexOf("/")) || "/";
};
