import type { StaffMember } from "@bbf/schema/types";

import { toStaffMember } from "@bbf/utils";

import { useDatabase } from "~~/server/composables/database";

/**
 * The staff the site lists: the published members, as the database holds
 * them, each in the shape the API serves. `list` is every one in order;
 * `fetch` is one by slug, or `null` when no published member has it.
 */
export const useStaff = () => {
  const db = useDatabase();

  const list = async (): Promise<StaffMember[]> => {
    const rows = await db.web.staff.list();
    return rows.map(toStaffMember);
  };

  const fetch = async (slug: string): Promise<StaffMember | null> => {
    const row = await db.web.staff.fetch.first({ slug });
    return row === null ? null : toStaffMember(row);
  };

  return { list, fetch };
};
