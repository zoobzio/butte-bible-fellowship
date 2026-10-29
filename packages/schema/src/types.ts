import type { z } from "zod";

import type { eventBody, eventId, eventPath, eventsQuery } from "./input/event";
import type { listingQuery } from "./input/listing";
import type { sermonBody, sermonPath, sermonsQuery } from "./input/sermon";
import type { staffBody, staffId, staffQuery } from "./input/staff";
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
  staffRole,
} from "./models/staff";

export type Slug = z.infer<typeof slug>;

export type EventDay = z.infer<typeof eventDay>;

export type EventTime = z.infer<typeof eventTime>;

export type ChurchEvent = z.infer<typeof churchEvent>;

export type ChurchEvents = z.infer<typeof churchEvents>;

export type EventRecord = z.infer<typeof eventRecord>;

export type EventListing = z.infer<typeof eventListing>;

export type Hast = z.infer<typeof hast>;

export type HastElement = z.infer<typeof hastElement>;

export type HastText = z.infer<typeof hastText>;

export type ContentStatus = z.infer<typeof contentStatus>;

export type StaffRole = z.infer<typeof staffRole>;

export type StaffMember = z.infer<typeof staffMember>;

export type StaffMembers = z.infer<typeof staffMembers>;

export type StaffRecord = z.infer<typeof staffRecord>;

export type StaffListing = z.infer<typeof staffListing>;

export type Sermon = z.infer<typeof sermon>;

export type Sermons = z.infer<typeof sermons>;

export type Hero = z.infer<typeof hero>;

export type Page = z.infer<typeof page>;

export type EventPath = z.infer<typeof eventPath>;

export type EventId = z.infer<typeof eventId>;

export type EventsQuery = z.infer<typeof eventsQuery>;

export type ListingQuery = z.infer<typeof listingQuery>;

export type EventBody = z.infer<typeof eventBody>;

export type StaffId = z.infer<typeof staffId>;

export type StaffQuery = z.infer<typeof staffQuery>;

export type StaffBody = z.infer<typeof staffBody>;

export type SermonPath = z.infer<typeof sermonPath>;

export type SermonsQuery = z.infer<typeof sermonsQuery>;

export type SermonBody = z.infer<typeof sermonBody>;
