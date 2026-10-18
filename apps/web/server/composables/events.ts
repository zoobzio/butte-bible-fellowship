import type { ChurchEvent } from "@bbf/schema/types";

import { toChurchEvent } from "@bbf/utils";

import { useDatabase } from "~~/server/composables/database";
import { churchDate } from "~~/server/utils/events";

/**
 * The events the site lists: the published ones, as the database holds
 * them, each in the shape the API serves. `list` is the calendar's feed —
 * every repeating event, Sunday first, then the one-offs on or after a
 * date, today at the church when none is named; `weekly` and `upcoming`
 * are its two halves on their own. `fetch` is one event by slug, with what
 * is written about it, or `null` when no published event has it.
 */
export const useEvents = () => {
  const db = useDatabase();

  const list = async (
    from: string = churchDate(new Date()),
  ): Promise<ChurchEvent[]> => {
    const rows = await db.web.events.list({ from });
    return rows.map(toChurchEvent);
  };

  const weekly = async (): Promise<ChurchEvent[]> => {
    const rows = await db.web.events.weekly();
    return rows.map(toChurchEvent);
  };

  const upcoming = async (
    from: string = churchDate(new Date()),
  ): Promise<ChurchEvent[]> => {
    const rows = await db.web.events.upcoming({ from });
    return rows.map(toChurchEvent);
  };

  const fetch = async (slug: string): Promise<ChurchEvent | null> => {
    const row = await db.web.events.fetch.first({ slug });
    return row === null ? null : toChurchEvent(row);
  };

  return { list, weekly, upcoming, fetch };
};
