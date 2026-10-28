export const isWithin = (path: string, page: string): boolean =>
  path === page || path.startsWith(`${page}/`);
