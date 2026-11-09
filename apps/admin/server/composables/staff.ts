import type {
  DateOperator,
  StaffBio,
  StaffBody,
  StaffListing,
  StaffQuery,
  StaffRecord,
  StaffSort,
  TextOperator,
} from "@bbf/schema/types";

import type { Param } from "~~/server/types/listing";

import { DATE_OPERATORS, TEXT_OPERATORS } from "@bbf/schema";
import { toStaffArguments, toStaffRecord } from "@bbf/utils";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { useDatabase } from "#layers/bbf/server/composables/database";
import { collect, entries, keys } from "objectively";

import { param } from "~~/server/utils/listing";

/** The text columns of a member, each filtered by the text operators. */
const TEXT_COLUMNS = ["name", "email", "phone", "summary", "photo"] as const;

/** The day columns of a member, by the name the list query gives each. */
const DAY_COLUMNS = { updated: "updatedAt", created: "createdAt" } as const;

type TextColumn = (typeof TEXT_COLUMNS)[number];
type DayColumn = keyof typeof DAY_COLUMNS;

type TextSearch = Record<`${TextColumn}_${Param<TextOperator>}`, string | null>;
type DaySearch = Record<`${DayColumn}_${Param<DateOperator>}`, string | null>;

/**
 * The filters on each text column as the query takes them, `name_contains`
 * from `nameContains` and the like, each operator's suffix the schema's:
 * null for each left out.
 */
const toTextSearch = (query: StaffQuery): TextSearch =>
  collect(
    TEXT_COLUMNS.flatMap((column) =>
      keys(TEXT_OPERATORS).map((operator) => [column, operator] as const),
    ),
    ([column, operator]) =>
      [
        `${column}_${param(operator)}`,
        query[`${column}${TEXT_OPERATORS[operator]}`] ?? null,
      ] as const,
  );

/**
 * The filters on each day column as the query takes them, `updated_before`
 * from `updatedAtBefore` and the like, each operator's suffix the schema's:
 * null for each left out.
 */
const toDaySearch = (query: StaffQuery): DaySearch =>
  collect(
    entries(DAY_COLUMNS).flatMap(([column, key]) =>
      keys(DATE_OPERATORS).map((operator) => [column, key, operator] as const),
    ),
    ([column, key, operator]) =>
      [
        `${column}_${param(operator)}`,
        query[`${key}${DATE_OPERATORS[operator]}`] ?? null,
      ] as const,
  );

/**
 * The search as the queries take it: null for each part left out, and the
 * church's time zone, which decides what day a member was changed on.
 */
const toSearch = (query: StaffQuery) => ({
  q: query.q === undefined || query.q === "" ? null : query.q,
  role_is: query.roleIs ?? null,
  role_not: query.roleNot ?? null,
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

  /**
   * A member's photo, written on its own: the URL it is read at, or null
   * for none. Their details and their bio stay as they are.
   */
  const setPhoto = async (
    id: number,
    photo: string | null,
  ): Promise<StaffRecord | null> => {
    const written = await db.admin.staff.photo.first({ id, photo });
    return written === null ? null : fetch(id);
  };

  /**
   * A member's bio, written on its own: the tree, or none when the body
   * leaves it out. Their details and their photo stay as they are.
   */
  const setBio = async (
    id: number,
    body: StaffBio,
  ): Promise<StaffRecord | null> => {
    const written = await db.admin.staff.bio.first({
      id,
      bio: body.bio ?? null,
    });
    return written === null ? null : fetch(id);
  };

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.staff.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, setPhoto, setBio, remove };
};
