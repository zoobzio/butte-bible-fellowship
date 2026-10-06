/** The days of the week an event can repeat on, Sunday first. */
export const EVENT_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/** The church's time zone: an event's times are read in it, and so is today. */
export const EVENT_TIME_ZONE = "America/Los_Angeles";
