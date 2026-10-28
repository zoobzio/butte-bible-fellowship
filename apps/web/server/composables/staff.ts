import type { StaffMember } from "@bbf/schema/types";

import { toStaffMember } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

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
