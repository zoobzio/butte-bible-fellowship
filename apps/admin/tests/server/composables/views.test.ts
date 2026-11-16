import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useViews } from "~~/server/composables/views";

const SUB = "104958204857204857204";

const ID = "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f";

/* A view of someone else's: a save of it writes nothing. */
const TAKEN = "5d2a8a7e-2b1c-4c3d-8e9f-0a1b2c3d4e5f";

const PAYLOAD = { sorting: [{ id: "name", desc: true }], pageSize: 50 };

const ROW = {
  id: ID,
  surface: "staff",
  name: "Elders",
  payload: PAYLOAD as unknown,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const RECORD = {
  id: ID,
  surface: "staff",
  name: "Elders",
  payload: PAYLOAD,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const list = vi.fn(async ({ sub }: { sub: string; surface: string }) =>
  sub === SUB ? [ROW] : [],
);
const saved = vi.fn(
  async (view: { id: string; name: string; payload: unknown }) =>
    view.id === TAKEN
      ? null
      : { ...ROW, id: view.id, name: view.name, payload: view.payload },
);
const deleted = vi.fn(async ({ id }: { id: string }) => (id === ID ? 1 : 0));

Object.assign(service, {
  admin: { views: { list, save: { first: saved }, delete: deleted } },
});

afterEach(() => {
  for (const query of [list, saved, deleted]) query.mockClear();
});

describe("useViews", () => {
  it("lists a user's views of one list, each as the admin reads it", async () => {
    expect(await useViews().list(SUB, "staff")).toEqual([RECORD]);
    expect(list).toHaveBeenLastCalledWith({ sub: SUB, surface: "staff" });
    expect(await useViews().list("someone-else", "staff")).toEqual([]);
  });

  it("saves a view under the id its address names, for the user, and hands back the record", async () => {
    const path = { surface: "staff" as const, id: ID };
    const body = { name: "The elders", payload: { ...PAYLOAD, pageSize: 10 } };
    expect(await useViews().save(SUB, path, body)).toEqual({
      ...RECORD,
      name: "The elders",
      payload: body.payload,
    });
    expect(saved).toHaveBeenLastCalledWith({
      sub: SUB,
      surface: "staff",
      id: ID,
      name: "The elders",
      payload: body.payload,
    });
  });

  it("hands back nothing when the view was not the user's to save", async () => {
    expect(
      await useViews().save(
        SUB,
        { surface: "staff", id: TAKEN },
        { name: "Elders", payload: PAYLOAD },
      ),
    ).toBeNull();
  });

  it("removes a user's view, and says whether there was one", async () => {
    expect(await useViews().remove(SUB, { surface: "staff", id: ID })).toBe(
      true,
    );
    expect(deleted).toHaveBeenLastCalledWith({
      sub: SUB,
      surface: "staff",
      id: ID,
    });
    expect(await useViews().remove(SUB, { surface: "staff", id: TAKEN })).toBe(
      false,
    );
  });
});
