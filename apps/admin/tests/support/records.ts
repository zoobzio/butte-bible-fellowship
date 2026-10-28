import type { EventRecord, StaffRecord } from "@bbf/schema/types";

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
  status: "published",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

export const WORSHIP: EventRecord = {
  id: 3,
  slug: "worship-service",
  title: "Worship Service",
  summary: "We gather on Sunday morning.",
  day: "sunday",
  weeks: [1, 3],
  start: "10:00",
  end: "11:30",
  status: "published",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

export const DINNER: EventRecord = {
  id: 4,
  slug: "harvest-dinner",
  title: "Harvest Dinner",
  note: "Bring a dish.",
  location: "Fellowship Hall",
  date: "2026-10-24",
  start: "17:30",
  status: "draft",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};
