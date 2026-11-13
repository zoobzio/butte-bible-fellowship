/** The admin's API for the site's pages, and the page the editor goes back to. */
export const ROUTE = "/api/content";
export const BACK = "/content";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** Where what is written on a page is written, on its own. */
export const body = (id: number): string => `${endpoint(id)}/body`;
