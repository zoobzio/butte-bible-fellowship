/**
 * What the people table's selection has asked for, which the people page
 * carries out: the people to remove, by the ids of their rows.
 */
export interface PeopleTasks {
  removing: string[] | null;
}
