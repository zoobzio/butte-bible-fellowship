import { useRequest } from "#imports";

/**
 * Loads a timeline for the page it sits on. Every visit fetches: the
 * timeline's state outlives the page, and what it lists may have changed
 * since. Its own `init` fetches once only, so the first visit goes through
 * it, as a table's does, and the rest start over from the first batch.
 */
export const useTimelineRequest = (timeline: {
  id: string;
  initialized: boolean;
  init(): Promise<boolean>;
  fetch(): Promise<void>;
}) =>
  useRequest(`timeline:${timeline.id}`, async () => {
    await (timeline.initialized ? timeline.fetch() : timeline.init());
    return true;
  });
