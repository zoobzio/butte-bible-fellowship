/** The admin's API for the people, and the page the editor goes back to. */
export const ROUTE = "/api/people";
export const BACK = "/people";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** Where a person's photo and bio are written, each on its own. */
export const avatar = (id: number): string => `${endpoint(id)}/avatar`;
export const bio = (id: number): string => `${endpoint(id)}/bio`;
