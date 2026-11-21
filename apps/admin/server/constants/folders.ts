/** The constraint that keeps a folder's name its own among those beside it. */
export const FOLDER_NAME_TAKEN = "folders_parent_id_name_key";

/** What refuses a folder the name of a document beside it, whose path it would share. */
export const FOLDER_PATH_TAKEN = "folders_path_taken";

/** The constraint that keeps a folder inside a folder that is there. */
export const FOLDER_PARENT_MISSING = "folders_parent_id_fkey";

/** The constraint that keeps a page filed in a folder that is there. */
export const CONTENT_FOLDER_MISSING = "content_folder_id_fkey";

/** The constraint that keeps a page's slug its own among all the pages. */
export const CONTENT_SLUG_TAKEN = "content_slug_key";

/** What refuses a page the name of a folder beside it, whose path it would share. */
export const CONTENT_PATH_TAKEN = "content_path_taken";

/**
 * What a write of a page is refused over, each constraint under the word
 * for it: a slug already `taken`, by a page anywhere or by a folder beside
 * it, or the folder it was to be in `gone`.
 */
export const CONTENT_REFUSALS = {
  [CONTENT_SLUG_TAKEN]: "taken",
  [CONTENT_PATH_TAKEN]: "taken",
  [CONTENT_FOLDER_MISSING]: "gone",
} as const;

/**
 * What a write of a folder is refused over, each constraint under the word
 * for it: a name already `taken` among the folders and pages beside it, or
 * the folder it was to be inside `gone`.
 */
export const FOLDER_REFUSALS = {
  [FOLDER_NAME_TAKEN]: "taken",
  [FOLDER_PATH_TAKEN]: "taken",
  [FOLDER_PARENT_MISSING]: "gone",
} as const;
