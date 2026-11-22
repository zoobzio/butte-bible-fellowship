import type {
  PersonBio,
  PersonBody,
  PersonListing,
  PersonQuery,
  PersonRecord,
  PersonSort,
} from "@bbf/schema/types";

import { toPersonArguments, toPersonRecord } from "@bbf/utils";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { useDatabase } from "#layers/bbf/server/composables/database";

import { toDaySearch, toListing, toTextSearch } from "~~/server/utils/listing";

/** The text columns of a person, each filtered by the text operators. */
const TEXT_COLUMNS = [
  "name",
  "title",
  "email",
  "phone",
  "summary",
  "address",
  "photo",
] as const;

/** The day columns of a person, by the name the list query gives each. */
const DAY_COLUMNS = { updated: "updatedAt", created: "createdAt" } as const;

/**
 * The search as the queries take it: null for each part left out, and the
 * church's time zone, which decides what day a person was changed on.
 */
const toSearch = (query: PersonQuery) => ({
  q: query.q === undefined || query.q === "" ? null : query.q,
  role_is: query.roleIs ?? null,
  role_not: query.roleNot ?? null,
  ...toTextSearch(TEXT_COLUMNS, query),
  tz: TIME_ZONE,
  ...toDaySearch(DAY_COLUMNS, query),
});

/**
 * The column of the row each sort key names.
 */
const SORT_COLUMNS: Record<PersonSort, string> = {
  name: "name",
  role: "role",
  title: "title",
  email: "email",
  phone: "phone",
  birthday: "birthday",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

/**
 * The order as the list query takes it: the column asked for, ascending
 * unless told otherwise. Asked for nothing, null: a search then lists the
 * nearest first, and otherwise the list's own order holds, by role, then by
 * last name, which the query falls back to after any sort.
 */
const toOrder = (query: PersonQuery) => ({
  sort: query.sort === undefined ? null : SORT_COLUMNS[query.sort],
  direction: query.direction ?? "asc",
});

export const usePeople = () => {
  const db = useDatabase();

  /** One page of the search, and how many people the whole search holds. */
  const list = (query: PersonQuery): Promise<PersonListing> => {
    const search = { ...toSearch(query), ...toOrder(query) };
    return toListing(
      query,
      (window) => db.admin.people.list({ ...search, ...window }),
      toPersonRecord,
    );
  };

  const fetch = async (id: number): Promise<PersonRecord | null> => {
    const row = await db.admin.people.fetch.first({ id });
    return row === null ? null : toPersonRecord(row);
  };

  const create = async (body: PersonBody): Promise<PersonRecord | null> => {
    const written = await db.admin.people.create.first(toPersonArguments(body));
    return written === null ? null : fetch(written.id);
  };

  const update = async (
    id: number,
    body: PersonBody,
  ): Promise<PersonRecord | null> => {
    const written = await db.admin.people.update.first({
      ...toPersonArguments(body),
      id,
    });
    return written === null ? null : fetch(id);
  };

  /**
   * A person's photo, written on its own: the URL it is read at, or null
   * for none. Their details and their bio stay as they are.
   */
  const setPhoto = async (
    id: number,
    photo: string | null,
  ): Promise<PersonRecord | null> => {
    const written = await db.admin.people.photo.first({ id, photo });
    return written === null ? null : fetch(id);
  };

  /**
   * A person's bio, written on its own: the tree, or none when the body
   * leaves it out. Their details and their photo stay as they are.
   */
  const setBio = async (
    id: number,
    body: PersonBio,
  ): Promise<PersonRecord | null> => {
    const written = await db.admin.people.bio.first({
      id,
      bio: body.bio ?? null,
    });
    return written === null ? null : fetch(id);
  };

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.people.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, setPhoto, setBio, remove };
};
