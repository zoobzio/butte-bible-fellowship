import type { TimelineOptions, UseTimeline } from "#imports";

/** A record a timeline lists: what each of its cards is read from. */
export type TimelineRecord = object;

/**
 * A timeline as the app configures it: the descriptors alone. The fetch
 * and the refresh are wired where the timeline is created.
 */
export type TimelineConfig<T extends TimelineRecord> = Omit<
  TimelineOptions<T>,
  "fetch" | "refresh" | "now" | "initial"
>;

export type TimelineFetch<T extends TimelineRecord> =
  TimelineOptions<T>["fetch"];

export type TimelineRefresh<T extends TimelineRecord> = NonNullable<
  TimelineOptions<T>["refresh"]
>;

export type TimelineFetchResult<T extends TimelineRecord> = Awaited<
  ReturnType<TimelineFetch<T>>
>;

export type TimelineService<T extends TimelineRecord> = ReturnType<
  UseTimeline<T>
>;
