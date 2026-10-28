import type {
  EventBody,
  EventListing,
  EventRecord,
  ListingQuery,
} from "@bbf/schema/types";

import { toEventArguments, toEventRecord } from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";
import { paginate } from "~~/server/utils/listing";

export const useEvents = () => {
  const db = useDatabase();

  const list = async (query: ListingQuery): Promise<EventListing> => {
    const rows = await db.admin.events.list();
    return paginate(rows.map(toEventRecord), query);
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

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.events.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, remove };
};
