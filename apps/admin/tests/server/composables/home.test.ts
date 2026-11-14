import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useHome } from "~~/server/composables/home";

const BODY = {
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value: "Welcome." }],
    },
  ],
};

const HEADING = "Discover God’s **Love**";

const ROW = {
  title: "Home",
  description: null as string | null,
  hero_heading: HEADING,
  hero_description: "Join us.",
  hero_action: "Learn More",
  hero_link: "/about-us",
  hero_image: null as string | null,
  body: null as unknown,
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const METADATA = {
  title: "Home",
  heroHeading: HEADING,
  heroDescription: "Join us.",
  heroAction: "Learn More",
  heroLink: "/about-us",
};

const RECORD = { ...METADATA, updatedAt: "2026-10-18T09:30:00.000Z" };

let row: typeof ROW | null = ROW;

const fetched = vi.fn(async () => row);
const updated = vi.fn(async (_args: object) =>
  row === null ? null : { updated_at: row.updated_at },
);
const written = vi.fn(async (args: { body: unknown }) => {
  if (row === null) return null;
  row = { ...row, body: args.body };
  return { updated_at: row.updated_at };
});

const pictured = vi.fn(async (args: { image: string | null }) => {
  if (row === null) return null;
  row = { ...row, hero_image: args.image };
  return { updated_at: row.updated_at };
});

Object.assign(service, {
  admin: {
    home: {
      fetch: { first: fetched },
      update: { first: updated },
      body: { first: written },
      image: { first: pictured },
    },
  },
});

afterEach(() => {
  row = ROW;
  fetched.mockClear();
  updated.mockClear();
  written.mockClear();
  pictured.mockClear();
});

describe("useHome", () => {
  it("fetches the home page, or nothing should its row be missing", async () => {
    expect(await useHome().fetch()).toEqual(RECORD);
    expect(fetched).toHaveBeenCalledWith();
    row = null;
    expect(await useHome().fetch()).toBeNull();
  });

  it("replaces its metadata, each field under its column's name, and hands back the record", async () => {
    const body = { ...METADATA, description: "A local church." };
    expect(await useHome().update(body)).toEqual(RECORD);
    expect(updated).toHaveBeenCalledWith({
      title: "Home",
      description: "A local church.",
      hero_heading: HEADING,
      hero_description: "Join us.",
      hero_action: "Learn More",
      hero_link: "/about-us",
    });
    expect(fetched).toHaveBeenCalledTimes(1);
  });

  it("sets what is written on it on its own, or clears it when the body has none", async () => {
    expect(await useHome().setBody({ body: BODY })).toEqual({
      ...RECORD,
      body: BODY,
    });
    expect(written).toHaveBeenLastCalledWith({ body: BODY });
    expect(await useHome().setBody({})).toEqual(RECORD);
    expect(written).toHaveBeenLastCalledWith({ body: null });
  });

  it("points it at its hero's picture on its own, or leaves it without one", async () => {
    const url = "https://cdn.example.com/home/1.jpg";
    expect(await useHome().setImage(url)).toEqual({
      ...RECORD,
      heroImage: url,
    });
    expect(pictured).toHaveBeenLastCalledWith({ image: url });
    expect(await useHome().setImage(null)).toEqual(RECORD);
    expect(pictured).toHaveBeenLastCalledWith({ image: null });
    expect(updated).not.toHaveBeenCalled();
  });

  it("writes nothing, and hands back nothing, should its row be missing", async () => {
    row = null;
    expect(await useHome().update(METADATA)).toBeNull();
    expect(await useHome().setBody({ body: BODY })).toBeNull();
    expect(await useHome().setImage(null)).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });
});
