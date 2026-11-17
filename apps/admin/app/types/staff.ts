/**
 * What the staff table's selection has asked for, which the staff page
 * carries out: the members to remove, by the ids of their rows.
 */
export interface StaffTasks {
  removing: string[] | null;
}
