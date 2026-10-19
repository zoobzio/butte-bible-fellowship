import type {
  ListingQuery,
  StaffBody,
  StaffListing,
  StaffRecord,
} from "@bbf/schema/types";

import { toStaffArguments, toStaffRecord } from "@bbf/utils";
import { useDatabase } from "~~/server/composables/database";
import { paginate } from "~~/server/utils/listing";

/**
 * The staff as the admin edits them: every member whatever their status,
 * each in the shape the API serves. `list` is one page of them in their
 * order; `fetch` is one by id, or `null` when no member has it. `create`
 * writes a member from their body and hands back the record,
 * or `null` should nothing be written; `update`
 * replaces every field of one, or hands back `null` when no member has the
 * id; `remove` deletes one, and says whether there was one to delete.
 */
export const useStaff = () => {
  const db = useDatabase();

  const list = async (query: ListingQuery): Promise<StaffListing> => {
    const rows = await db.admin.staff.list();
    return paginate(rows.map(toStaffRecord), query);
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
