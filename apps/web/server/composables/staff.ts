import type { StaffMember } from "@bbf/schema/types";

import { toStaffMember } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

export const useStaff = () => {
  const db = useDatabase();

  const list = async (): Promise<StaffMember[]> => {
    const rows = await db.web.staff.list();
    return rows.map(toStaffMember);
  };

  return { list };
};
