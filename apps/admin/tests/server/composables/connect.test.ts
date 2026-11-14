import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useConnect } from "~~/server/composables/connect";

const BODY = {
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value: "Come and see." }],
    },
  ],
};

const ROW = {
  title: "Connect",
  description: "We’d love to meet you." as string | null,
  address: "2255 Pillsbury Road, Chico",
  phone: "530-892-0521" as string | null,
  fax: null as string | null,
  email: null as string | null,
  hours: "Friday: 9am–noon" as string | null,
  body: null as unknown,
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const RECORD = {
  title: "Connect",
  description: "We’d love to meet you.",
  address: "2255 Pillsbury Road, Chico",
  phone: "530-892-0521",
  hours: "Friday: 9am–noon",
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
    connect: {
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

describe("useConnect", () => {
  it("fetches the connect page, or nothing should its row be missing", async () => {
    expect(await useConnect().fetch()).toEqual(RECORD);
    expect(fetched).toHaveBeenCalledWith();
    row = null;
    expect(await useConnect().fetch()).toBeNull();
  });

  it("replaces its metadata, null for what the body leaves out, and hands back the record", async () => {
    expect(
      await useConnect().update({ title: "Find Us", address: "1 Main Street" }),
    ).toEqual(RECORD);
    expect(updated).toHaveBeenCalledWith({
      title: "Find Us",
      description: null,
      address: "1 Main Street",
      phone: null,
      fax: null,
      email: null,
      hours: null,
    });
    expect(fetched).toHaveBeenCalledTimes(1);
  });

  it("sets what is written on it on its own, or clears it when the body has none", async () => {
    expect(await useConnect().setBody({ body: BODY })).toEqual({
      ...RECORD,
      body: BODY,
    });
    expect(written).toHaveBeenLastCalledWith({ body: BODY });
    expect(await useConnect().setBody({})).toEqual(RECORD);
    expect(written).toHaveBeenLastCalledWith({ body: null });
  });

  it("writes nothing, and hands back nothing, should its row be missing", async () => {
    row = null;
    expect(
      await useConnect().update({ title: "Connect", address: "1 Main Street" }),
    ).toBeNull();
    expect(await useConnect().setBody({ body: BODY })).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });
});
