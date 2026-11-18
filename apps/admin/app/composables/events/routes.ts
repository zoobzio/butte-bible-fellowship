/** The admin's API for the events, and the page the editor goes back to. */
export const ROUTE = "/api/events";
export const BACK = "/events";
/** Where the calendar asks for the events held within the days it shows. */
export const HELD = `${ROUTE}/held`;
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

/**
 * Where an event's picture and what is written about it are written, each
 * on its own.
 */
export const image = (id: number): string => `${endpoint(id)}/image`;
export const body = (id: number): string => `${endpoint(id)}/body`;
