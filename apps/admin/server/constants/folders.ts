/** The constraint that keeps a folder's name its own among those beside it. */
export const FOLDER_NAME_TAKEN = "folders_parent_id_name_key";

/** The constraint that keeps a folder inside a folder that is there. */
export const FOLDER_PARENT_MISSING = "folders_parent_id_fkey";

/** The constraint that keeps a page filed in a folder that is there. */
export const CONTENT_FOLDER_MISSING = "content_folder_id_fkey";

/** What filing a page is refused over: the folder it was to be in `gone`. */
export const CONTENT_REFUSALS = {
  [CONTENT_FOLDER_MISSING]: "gone",
} as const;

/**
 * What a write of a folder is refused over, each constraint under the word
 * for it: a name already `taken` among the folders beside it, or the
 * folder it was to be inside `gone`.
 */
export const FOLDER_REFUSALS = {
  [FOLDER_NAME_TAKEN]: "taken",
  [FOLDER_PARENT_MISSING]: "gone",
} as const;
