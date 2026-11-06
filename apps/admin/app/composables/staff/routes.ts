/** The admin's API for the staff, and the page the editor goes back to. */
export const ROUTE = "/api/staff";
export const BACK = "/staff";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** Where a member's photo and bio are written, each on its own. */
export const avatar = (id: number): string => `${endpoint(id)}/avatar`;
export const bio = (id: number): string => `${endpoint(id)}/bio`;
