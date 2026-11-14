/** The admin's API for the site's own pages, and the page that lists them. */
export const ROUTE = "/api/site";
export const BACK = "/site";

/** Each page of the site with a table of its own: where it is read and written. */
export const HOME = `${ROUTE}/home`;
export const ABOUT = `${ROUTE}/about`;
export const CONNECT = `${ROUTE}/connect`;

/**
 * Where what is written on such a page, and the picture of the one that
 * has one, are written, each on its own.
 */
export const body = (endpoint: string): string => `${endpoint}/body`;
export const image = (endpoint: string): string => `${endpoint}/image`;
