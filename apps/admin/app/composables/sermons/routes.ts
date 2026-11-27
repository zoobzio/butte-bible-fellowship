/** The admin's API for the sermons, and the page a sermon's goes back to. */
export const ROUTE = "/api/sermons";
export const BACK = "/sermons";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** Where the sermons are synced with the church's YouTube channel. */
export const SYNC = `${ROUTE}/sync`;
