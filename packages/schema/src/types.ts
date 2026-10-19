import type { z } from "zod";

import type { eventBody, eventId, eventPath, eventsQuery } from "./input/event";
import type { listingQuery } from "./input/listing";
import type { sermonBody, sermonPath, sermonsQuery } from "./input/sermon";
import type { staffBody, staffId, staffPath } from "./input/staff";
import type {
  churchEvent,
  churchEvents,
  eventDay,
  eventListing,
  eventRecord,
  eventTime,
} from "./models/event";
import type { hast, hastElement, hastText } from "./models/hast";
import type { hero, page } from "./models/page";
import type { sermon, sermons } from "./models/sermon";
import type { slug } from "./models/slug";
import type {
  contentStatus,
  staffListing,
  staffMember,
  staffMembers,
  staffRecord,
} from "./models/staff";

// Models: what the API answers with.

/** What names a thing in an address: `/events/<slug>`, `/staff/<slug>`. */
export type Slug = z.infer<typeof slug>;

/** A day of the week, as an event names the one it repeats on. */
export type EventDay = z.infer<typeof eventDay>;

/** A time of day on a 24-hour clock, `HH:MM`. */
export type EventTime = z.infer<typeof eventTime>;

/** An event of the church: held once on a date, or weekly on a day. */
export type ChurchEvent = z.infer<typeof churchEvent>;

/** The events the site lists: the repeating ones Sunday first, then the one-offs to come. */
export type ChurchEvents = z.infer<typeof churchEvents>;

/** An event as the admin reads it: every column of its row, whatever its status. */
export type EventRecord = z.infer<typeof eventRecord>;

/** A page of the events as the admin lists them, and how many there are in all. */
export type EventListing = z.infer<typeof eventListing>;

/** Rich text as the API serves it: an HTML syntax tree of elements and text. */
export type Hast = z.infer<typeof hast>;

/** An HTML element of a tree: its tag, its attributes, and what it holds. */
export type HastElement = z.infer<typeof hastElement>;

/** A run of text in a tree. */
export type HastText = z.infer<typeof hastText>;

/** Whether a piece of content reaches the site: draft, published or archived. */
export type ContentStatus = z.infer<typeof contentStatus>;

/** Someone who serves the church, as the site lists them. */
export type StaffMember = z.infer<typeof staffMember>;

/** The staff the site lists, in their order. */
export type StaffMembers = z.infer<typeof staffMembers>;

/** A staff member as the admin reads them: every column of their row, whatever their status. */
export type StaffRecord = z.infer<typeof staffRecord>;

/** A page of the staff as the admin lists them, and how many there are in all. */
export type StaffListing = z.infer<typeof staffListing>;

/** A sermon preached at the church: the day it was preached, who preached it, and its recording. */
export type Sermon = z.infer<typeof sermon>;

/** The sermons the site lists, newest first. */
export type Sermons = z.infer<typeof sermons>;

/** The words and picture a page opens with, over its body. */
export type Hero = z.infer<typeof hero>;

/** A page's front matter: its title and description, and what the site's pages add. */
export type Page = z.infer<typeof page>;

// Inputs: what a request carries.

/** The path of an event's own page: `/events/{slug}`. */
export type EventPath = z.infer<typeof eventPath>;

/** The path of one event to the admin: `/events/{id}`. */
export type EventId = z.infer<typeof eventId>;

/** The query of the events list: from which date the one-offs are listed. */
export type EventsQuery = z.infer<typeof eventsQuery>;

/** The query of a listing: which page, and how many items to a page. */
export type ListingQuery = z.infer<typeof listingQuery>;

/** An event as it is written: what creating one takes, and what updating one replaces. */
export type EventBody = z.infer<typeof eventBody>;

/** The path of one staff member: `/staff/{slug}`. */
export type StaffPath = z.infer<typeof staffPath>;

/** The path of one staff member to the admin: `/staff/{id}`. */
export type StaffId = z.infer<typeof staffId>;

/** A staff member as they are written: what creating one takes, and what updating one replaces. */
export type StaffBody = z.infer<typeof staffBody>;

/** The path of a sermon's own page: `/sermons/{slug}`. */
export type SermonPath = z.infer<typeof sermonPath>;

/** The query of the sermons list: how many of the newest to take. */
export type SermonsQuery = z.infer<typeof sermonsQuery>;

/** A sermon as it is written: what creating one takes, and what updating one replaces. */
export type SermonBody = z.infer<typeof sermonBody>;
