import type {
  StaffBody,
  StaffListing,
  StaffQuery,
  StaffRecord,
} from "@bbf/schema/types";

import { toStaffArguments, toStaffRecord } from "@bbf/utils";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { useDatabase } from "#layers/bbf/server/composables/database";

/**
 * The search as the queries take it: null for each part left out, and the
 * church's time zone, which decides what day a member was changed on.
 */
const toSearch = (query: StaffQuery) => ({
  q: query.q === undefined || query.q === "" ? null : query.q,
  role: query.role ?? null,
  status: query.status ?? null,
  tz: TIME_ZONE,
  updated_before: query.updatedAtBefore ?? null,
  updated_after: query.updatedAtAfter ?? null,
  updated_on: query.updatedAtOn ?? null,
  created_before: query.createdAtBefore ?? null,
  created_after: query.createdAtAfter ?? null,
  created_on: query.createdAtOn ?? null,
});

export const useStaff = () => {
  const db = useDatabase();

  const list = async (query: StaffQuery): Promise<StaffListing> => {
    const search = toSearch(query);
    const [rows, counted] = await Promise.all([
      db.admin.staff.list({
        ...search,
        size: query.size,
        offset: (query.page - 1) * query.size,
      }),
      db.admin.staff.count.first(search),
    ]);
    return { items: rows.map(toStaffRecord), total: counted?.total ?? 0 };
  };

  const fetch = async (id: number): Promise<StaffRecord | null> => {
    const row = await db.admin.staff.fetch.first({ id });
    return row === null ? null : toStaffRecord(row);
  };

  const create = async (body: StaffBody): Promise<StaffRecord | null> => {
    const written = await db.admin.staff.create.first(toStaffArguments(body));
    return written === null ? null : fetch(written.id);
  };

  const update = async (
    id: number,
    body: StaffBody,
  ): Promise<StaffRecord | null> => {
    const written = await db.admin.staff.update.first({
      ...toStaffArguments(body),
      id,
    });
    return written === null ? null : fetch(id);
  };

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.staff.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, remove };
};
