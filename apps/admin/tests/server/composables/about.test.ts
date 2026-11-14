import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useAbout } from "~~/server/composables/about";

const BODY = {
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value: "Our vision." }],
    },
  ],
};

const ROW = {
  title: "About Us",
  description: "A clean canvas." as string | null,
  body: null as unknown,
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const RECORD = {
  title: "About Us",
  description: "A clean canvas.",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

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

Object.assign(service, {
  admin: {
    about: {
      fetch: { first: fetched },
      update: { first: updated },
      body: { first: written },
    },
  },
});

afterEach(() => {
  row = ROW;
  fetched.mockClear();
  updated.mockClear();
  written.mockClear();
});

describe("useAbout", () => {
  it("fetches About Us, or nothing should its row be missing", async () => {
    expect(await useAbout().fetch()).toEqual(RECORD);
    expect(fetched).toHaveBeenCalledWith();
    row = null;
    expect(await useAbout().fetch()).toBeNull();
  });

  it("replaces its metadata, null for what the body leaves out, and hands back the record", async () => {
    expect(await useAbout().update({ title: "Who We Are" })).toEqual(RECORD);
    expect(updated).toHaveBeenCalledWith({
      title: "Who We Are",
      description: null,
    });
    expect(fetched).toHaveBeenCalledTimes(1);
  });

  it("sets what is written on it on its own, or clears it when the body has none", async () => {
    expect(await useAbout().setBody({ body: BODY })).toEqual({
      ...RECORD,
      body: BODY,
    });
    expect(written).toHaveBeenLastCalledWith({ body: BODY });
    expect(await useAbout().setBody({})).toEqual(RECORD);
    expect(written).toHaveBeenLastCalledWith({ body: null });
  });

  it("writes nothing, and hands back nothing, should its row be missing", async () => {
    row = null;
    expect(await useAbout().update({ title: "About Us" })).toBeNull();
    expect(await useAbout().setBody({ body: BODY })).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });
});
