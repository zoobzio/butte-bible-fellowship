import type {
  EventArticle,
  EventBody,
  EventListing,
  EventQuery,
  EventRecord,
  EventSort,
} from "@bbf/schema/types";

import { toEventArguments, toEventRecord } from "@bbf/utils";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { useDatabase } from "#layers/bbf/server/composables/database";

import { toDaySearch, toListing, toTextSearch } from "~~/server/utils/listing";

/** The text columns of an event, each filtered by the text operators. */
const TEXT_COLUMNS = ["title", "slug", "summary", "image"] as const;

/**
 * The day columns of an event, by the name the list query gives each: the
 * date it is held, and the days its row was changed and added.
 */
const DAY_COLUMNS = {
  date: "date",
  updated: "updatedAt",
  created: "createdAt",
} as const;

/**
 * The search as the query takes it: null for each part left out, and the
 * church's time zone, which decides what day an event was changed on.
 */
const toSearch = (query: EventQuery) => ({
  q: query.q === undefined || query.q === "" ? null : query.q,
  recurring_is: query.recurringIs ?? null,
  recurring_not: query.recurringNot ?? null,
  day_is: query.dayIs ?? null,
  day_not: query.dayNot ?? null,
  ...toTextSearch(TEXT_COLUMNS, query),
  tz: TIME_ZONE,
  ...toDaySearch(DAY_COLUMNS, query),
});

/**
 * The column of the row each sort key names.
 */
const SORT_COLUMNS: Record<EventSort, string> = {
  title: "title",
  slug: "slug",
  day: "day",
  date: "date",
  recurring: "recurring",
  start: "start_time",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

/**
 * The order as the list query takes it: the column asked for, ascending
 * unless told otherwise. Asked for nothing, null: a search then lists the
 * nearest first, and otherwise the admin's order holds, the recurring
 * events Sunday first, then the one-offs by date, which the query falls
 * back to after any sort.
 */
const toOrder = (query: EventQuery) => ({
  sort: query.sort === undefined ? null : SORT_COLUMNS[query.sort],
  direction: query.direction ?? "asc",
});

export const useEvents = () => {
  const db = useDatabase();

  /** One page of the search, and how many events the whole search holds. */
  const list = (query: EventQuery): Promise<EventListing> => {
    const search = { ...toSearch(query), ...toOrder(query) };
    return toListing(
      query,
      (window) => db.admin.events.list({ ...search, ...window }),
      toEventRecord,
    );
  };

  const fetch = async (id: number): Promise<EventRecord | null> => {
    const row = await db.admin.events.fetch.first({ id });
    return row === null ? null : toEventRecord(row);
  };

  const create = async (body: EventBody): Promise<EventRecord | null> => {
    const written = await db.admin.events.create.first(toEventArguments(body));
    return written === null ? null : fetch(written.id);
  };

  const update = async (
    id: number,
    body: EventBody,
  ): Promise<EventRecord | null> => {
    const written = await db.admin.events.update.first({
      ...toEventArguments(body),
      id,
    });
    return written === null ? null : fetch(id);
  };

  /**
   * An event's picture, written on its own: the URL it is read at, or null
   * for none. Its details and what is written about it stay as they are.
   */
  const setImage = async (
    id: number,
    image: string | null,
  ): Promise<EventRecord | null> => {
    const written = await db.admin.events.image.first({ id, image });
    return written === null ? null : fetch(id);
  };

  /**
   * What is written about an event, on its own: the tree, or none when the
   * body leaves it out. Its details and its picture stay as they are.
   */
  const setBody = async (
    id: number,
    article: EventArticle,
  ): Promise<EventRecord | null> => {
    const written = await db.admin.events.body.first({
      id,
      body: article.body ?? null,
    });
    return written === null ? null : fetch(id);
  };

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.events.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, setImage, setBody, remove };
};
