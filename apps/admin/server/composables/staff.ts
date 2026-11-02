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

const TEXT_COLUMNS = ["name", "email", "phone", "summary", "photo"] as const;

const TEXT_OPERATORS = {
  is: "Is",
  not: "Not",
  contains: "Contains",
  not_contains: "NotContains",
  starts_with: "StartsWith",
  ends_with: "EndsWith",
} as const;

const DAY_COLUMNS = { updated: "updatedAt", created: "createdAt" } as const;

const DAY_OPERATORS = {
  before: "Before",
  after: "After",
  on: "On",
  on_or_after: "OnOrAfter",
  on_or_before: "OnOrBefore",
} as const;

type TextColumn = (typeof TEXT_COLUMNS)[number];
type TextOperator = keyof typeof TEXT_OPERATORS;
type DayColumn = keyof typeof DAY_COLUMNS;
type DayOperator = keyof typeof DAY_OPERATORS;

type TextSearch = Record<`${TextColumn}_${TextOperator}`, string | null>;
type DaySearch = Record<`${DayColumn}_${DayOperator}`, string | null>;

/**
 * The filters on each text column as the query takes them, `name_contains`
 * from `nameContains` and the like: null for each left out.
 */
const toTextSearch = (query: StaffQuery): TextSearch =>
  Object.fromEntries(
    TEXT_COLUMNS.flatMap((column) =>
      Object.entries(TEXT_OPERATORS).map(([operator, suffix]) => [
        `${column}_${operator}`,
        query[`${column}${suffix}`] ?? null,
      ]),
    ),
  ) as TextSearch;

/**
 * The filters on each day column as the query takes them, `updated_before`
 * from `updatedAtBefore` and the like: null for each left out.
 */
const toDaySearch = (query: StaffQuery): DaySearch =>
  Object.fromEntries(
    Object.entries(DAY_COLUMNS).flatMap(([column, key]) =>
      Object.entries(DAY_OPERATORS).map(([operator, suffix]) => [
        `${column}_${operator}`,
        query[`${key}${suffix}`] ?? null,
      ]),
    ),
  ) as DaySearch;

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
  ...toTextSearch(query),
  tz: TIME_ZONE,
  ...toDaySearch(query),
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
 * unless told otherwise. Asked for nothing, null: a search then lists the
 * nearest first, and otherwise the site's order holds, by role, then by
 * name, which the query falls back to after any sort.
 */
const toOrder = (query: StaffQuery) => ({
  sort: query.sort === undefined ? null : SORT_COLUMNS[query.sort],
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
