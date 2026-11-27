/**
 * A recording as the church's YouTube channel lists it in its feed: its
 * id, what it is called, what is written under it, and when it was
 * published, an instant.
 */
export interface FeedVideo {
  video: string;
  title: string;
  description?: string;
  published: string;
}

/**
 * A recording as the sermons take it in: its id, its title and who
 * preached it, as its name on YouTube gives the two, the first paragraph
 * written under it, the day it was preached, and the slug it goes by, with
 * the one it goes by instead where that is taken.
 */
export interface FeedEntry {
  video: string;
  title: string;
  speaker: string | null;
  summary: string | null;
  date: string;
  slug: string;
  fallback: string;
}
