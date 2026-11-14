import type {
  AboutRecord,
  ContentRecord,
  EventRecord,
  HomeRecord,
  StaffRecord,
} from "@bbf/schema/types";

export const BIO = {
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value: "Has served since 2010." }],
    },
  ],
};

export const STAFF: StaffRecord = {
  id: 1,
  name: "Jane Doe",
  role: "elder",
  summary: "Has served since 2010.",
  bio: BIO,
  email: "jane@example.com",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

export const WORSHIP: EventRecord = {
  id: 3,
  slug: "worship-service",
  title: "Worship Service",
  summary: "We gather on Sunday morning.",
  body: BIO,
  date: "2026-01-04",
  day: "sunday",
  recurring: true,
  weeks: [1, 3],
  start: "10:00",
  end: "11:30",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

export const DINNER: EventRecord = {
  id: 4,
  slug: "harvest-dinner",
  title: "Harvest Dinner",
  date: "2026-10-24",
  day: "saturday",
  recurring: false,
  start: "17:30",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

export const HOME: ContentRecord = {
  id: 5,
  slug: "index",
  title: "Butte Bible Fellowship",
  description: "A local church in Chico.",
  body: BIO,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

export const ABOUT: ContentRecord = {
  id: 6,
  slug: "about-us",
  title: "About Us",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

/** The heading the home page opens with: one line, its highlight between asterisks. */
export const HEADING = "Discover God’s **Love, Grace & Truth**";

/** The site's home page, as its tab of the settings reads it. */
export const HOME_PAGE: HomeRecord = {
  title: "Butte Bible Fellowship",
  description: "A local church in Chico.",
  heroHeading: HEADING,
  heroDescription: "Join us in the pursuit of His character.",
  heroAction: "Learn More",
  heroLink: "/about-us",
  body: BIO,
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/** The site's About Us page, as its tab of the settings reads it. */
export const ABOUT_PAGE: AboutRecord = {
  title: "About Us",
  description: "A clean canvas.",
  body: BIO,
  updatedAt: "2026-10-18T09:30:00.000Z",
};
