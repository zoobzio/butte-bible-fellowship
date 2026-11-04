/** The admin's API for the staff, and the page the editor goes back to. */
export const ROUTE = "/api/staff";
export const BACK = "/staff";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;
