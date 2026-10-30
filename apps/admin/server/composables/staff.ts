import type {
  StaffBody,
  StaffListing,
  StaffQuery,
  StaffRecord,
  StaffSort,
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
  role_is: query.roleIs ?? null,
  role_not: query.roleNot ?? null,
  status_is: query.statusIs ?? null,
  status_not: query.statusNot ?? null,
  email: query.email ?? null,
  phone: query.phone ?? null,
  summary: query.summary ?? null,
  photo: query.photo ?? null,
  tz: TIME_ZONE,
  updated_before: query.updatedAtBefore ?? null,
  updated_after: query.updatedAtAfter ?? null,
  updated_on: query.updatedAtOn ?? null,
  created_before: query.createdAtBefore ?? null,
  created_after: query.createdAtAfter ?? null,
  created_on: query.createdAtOn ?? null,
});

/**
 * The column of the row each sort key names.
 */
const SORT_COLUMNS: Record<StaffSort, string> = {
  name: "name",
  role: "role",
  status: "status",
  email: "email",
  phone: "phone",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

/**
 * The order as the list query takes it: the column asked for, ascending
 * unless told otherwise. Asked for nothing, the site's order: by role,
 * then by name, which the query falls back to after any sort.
 */
const toOrder = (query: StaffQuery) => ({
  sort: SORT_COLUMNS[query.sort ?? "role"],
  direction: query.direction ?? "asc",
});

export const useStaff = () => {
  const db = useDatabase();

  /**
   * One page of the search, and how many rows the whole search holds,
   * which every row of the page carries. A page past the end carries no
   * row to read it from, so the first row of the search is asked for it
   * then, and nothing found means nothing held.
   */
  const list = async (query: StaffQuery): Promise<StaffListing> => {
    const search = { ...toSearch(query), ...toOrder(query) };
    const rows = await db.admin.staff.list({
      ...search,
      size: query.size,
      offset: (query.page - 1) * query.size,
    });
    const total =
      rows[0]?.total ??
      (query.page === 1
        ? 0
        : ((await db.admin.staff.list({ ...search, size: 1, offset: 0 }))[0]
            ?.total ?? 0));
    return { items: rows.map(toStaffRecord), total };
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
