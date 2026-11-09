/** The admin's API for the events, and the page the editor goes back to. */
export const ROUTE = "/api/events";
export const BACK = "/events";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

/**
 * Where an event's picture and what is written about it are written, each
 * on its own.
 */
export const image = (id: number): string => `${endpoint(id)}/image`;
export const body = (id: number): string => `${endpoint(id)}/body`;
