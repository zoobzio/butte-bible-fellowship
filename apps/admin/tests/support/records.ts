import type {
  AboutRecord,
  AppearanceRecord,
  ConnectRecord,
  ContentRecord,
  EventRecord,
  FolderRecord,
  HomeRecord,
  PersonRecord,
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

export const PERSON: PersonRecord = {
  id: 1,
  firstName: "Jane",
  lastName: "Doe",
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
  mime: "application/vnd.bbf.article+json",
  slug: "index",
  title: "Butte Bible Fellowship",
  description: "A local church in Chico.",
  body: BIO,
  size: 2048,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

export const ABOUT: ContentRecord = {
  id: 6,
  mime: "application/vnd.bbf.article+json",
  slug: "about-us",
  title: "About Us",
  size: 0,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

/** A folder at the top of the content, which holds the one inside it. */
export const NOTES: FolderRecord = {
  id: 2,
  name: "Sermon notes",
  count: 1,
  size: 4096,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/** A folder inside it, which holds nothing. */
export const ROMANS: FolderRecord = {
  id: 3,
  parent: 2,
  name: "Romans",
  count: 0,
  size: 0,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

/** The heading the home page opens with: one line, its highlight between asterisks. */
export const HEADING = "Discover God’s **Love, Grace & Truth**";

/** The site's home page, as the page that edits it reads it. */
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

/** The site's About Us page, as the page that edits it reads it. */
export const ABOUT_PAGE: AboutRecord = {
  title: "About Us",
  description: "A clean canvas.",
  body: BIO,
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/** The site's connect page, as the page that edits it reads it. */
export const CONNECT_PAGE: ConnectRecord = {
  title: "Connect",
  description: "We’d love to meet you.",
  address: "2255 Pillsbury Road, Chico, California 95926",
  phone: "530-892-0521",
  fax: "530-898-1851",
  email: "office@bbfchurchchico.org",
  hours: "Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon",
  body: BIO,
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/** How the site looks with nothing set over its theme: the row as it is made. */
export const APPEARANCE: AppearanceRecord = {
  seeds: {},
  input: {},
  updatedAt: "2026-11-19T18:00:00.000Z",
};

/** How the site looks with a color and two modifiers set over its theme. */
export const APPEARANCE_SET: AppearanceRecord = {
  seeds: { primary: "#7c3aed" },
  input: { color: "dark", text: "lg" },
  updatedAt: "2026-11-19T18:00:00.000Z",
};
