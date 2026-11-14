/** The admin's API for the documents, and the page the editor goes back to. */
export const ROUTE = "/api/content";
export const BACK = "/content";
export const endpoint = (id: number): string => `${ROUTE}/${id}`;

/** Where what is written on a document is written, on its own. */
export const body = (id: number): string => `${endpoint(id)}/body`;

/** Where the folder a document is filed in is written, on its own. */
export const placement = (id: number): string => `${endpoint(id)}/folder`;

/** The admin's API for the content's folders, under the documents' own. */
export const FOLDERS = `${ROUTE}/folders`;
export const folder = (id: number): string => `${FOLDERS}/${id}`;

/** Where the folder a folder is inside is written, on its own. */
export const parent = (id: number): string => `${folder(id)}/parent`;
