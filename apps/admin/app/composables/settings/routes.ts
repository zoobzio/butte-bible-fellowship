/** The admin's API for the site's settings, and the page that holds them. */
export const ROUTE = "/api/settings";
export const SETTINGS = "/settings";

/** Each page of the site with a table of its own: where it is read and written. */
export const HOME = `${ROUTE}/home`;
export const ABOUT = `${ROUTE}/about`;

/**
 * Where what is written on such a page, and the picture of the one that
 * has one, are written, each on its own.
 */
export const body = (endpoint: string): string => `${endpoint}/body`;
export const image = (endpoint: string): string => `${endpoint}/image`;

/** The tabs of the settings page, each a page under it. */
export const TABS = {
  home: `${SETTINGS}/home`,
  about: `${SETTINGS}/about-us`,
  appearance: `${SETTINGS}/appearance`,
} as const;
