import { useRequest } from "#imports";

/**
 * Loads a calendar for the page it sits on. Every visit fetches: the
 * calendar's state outlives the page, and what it shows may have changed
 * since. Its own `init` fetches once only, and is what lets a saved view
 * put in place before it be read by its first fetch: so the first visit
 * goes through it, as a table's does, and the day, the view and the search
 * the calendar holds are kept and asked for again on the rest.
 */
export const useCalendarRequest = (calendar: {
  id: string;
  initialized: boolean;
  init(): Promise<boolean>;
  fetch(): Promise<void>;
}) =>
  useRequest(`calendar:${calendar.id}`, async () => {
    await (calendar.initialized ? calendar.fetch() : calendar.init());
    return true;
  });
