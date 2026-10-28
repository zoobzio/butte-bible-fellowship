import type { ChurchEvent } from "@bbf/schema/types";

import { toChurchEvent } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";
import { churchDate } from "~~/server/utils/events";

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
