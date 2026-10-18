import { EVENT_TIME_ZONE } from "~~/server/constants/events";

/**
 * The date at the church at a moment, as `YYYY-MM-DD`, wherever it is being
 * asked: the day the events are listed from when a request names none.
 */
export const churchDate = (now: Date): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};
