import type { z } from "zod";

import type { eventBody, eventPath, eventsQuery } from "./input/event";
import type { sermonPath, sermonsQuery } from "./input/sermon";
import type { staffBody, staffPath } from "./input/staff";
import type { churchEvent, eventDay, eventTime } from "./models/event";
import type { hero, page } from "./models/page";
import type { sermon } from "./models/sermon";
import type { slug } from "./models/slug";
import type { staffMember } from "./models/staff";

// Models: what the API answers with.

/** What names a thing in an address: `/events/<slug>`, `/staff/<slug>`. */
export type Slug = z.infer<typeof slug>;

/** A day of the week, as an event names the one it repeats on. */
export type EventDay = z.infer<typeof eventDay>;

/** A time of day on a 24-hour clock, `HH:MM`. */
export type EventTime = z.infer<typeof eventTime>;

/** An event of the church: held once on a date, or weekly on a day. */
export type ChurchEvent = z.infer<typeof churchEvent>;

/** Someone who serves the church, as the contact page lists them. */
export type StaffMember = z.infer<typeof staffMember>;

/** A sermon on the church's YouTube channel, as its feed lists it. */
export type Sermon = z.infer<typeof sermon>;

/** The words and picture a page opens with, over its body. */
export type Hero = z.infer<typeof hero>;

/** A page's front matter: its title and description, and what the site's pages add. */
export type Page = z.infer<typeof page>;

// Inputs: what a request carries.

/** The path of an event's own page: `/events/{slug}`. */
export type EventPath = z.infer<typeof eventPath>;

/** The query of the events list: from which date the one-offs are listed. */
export type EventsQuery = z.infer<typeof eventsQuery>;

/** An event as it is written: what creating one takes, and what updating one replaces. */
export type EventBody = z.infer<typeof eventBody>;

/** The path of one staff member: `/staff/{slug}`. */
export type StaffPath = z.infer<typeof staffPath>;

/** A staff member as they are written: what creating one takes, and what updating one replaces. */
export type StaffBody = z.infer<typeof staffBody>;

/** The path of one sermon: `/sermons/{id}`. */
export type SermonPath = z.infer<typeof sermonPath>;

/** The query of the sermons list: how many of the newest to take. */
export type SermonsQuery = z.infer<typeof sermonsQuery>;
