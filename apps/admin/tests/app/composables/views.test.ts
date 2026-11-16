import { describe, expect, it, vi } from "vitest";

import { ROUTE, useViewStorage, useViewsRequest } from "~/composables/views";

const ID = "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f";

const PAYLOAD = { sorting: [{ id: "name", desc: true }], pageSize: 50 };

const RECORD = {
  id: ID,
  surface: "staff",
  name: "Elders",
  payload: PAYLOAD,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const VIEW = { id: ID, name: "Elders", origin: "user" as const };

/* The storage hands the service on to nothing, so a stand-in will do. */
const service = {} as never;

describe("useViewStorage", () => {
  it("keeps each list's views under the list's own name", () => {
    expect(ROUTE).toBe("/api/views");
  });

  it("loads the views of its list as they were stored", async () => {
    const fetch = vi.fn(async () => [RECORD]);
    vi.stubGlobal("$fetch", fetch);
    expect(await useViewStorage("staff").load(service)).toEqual([RECORD]);
    expect(fetch).toHaveBeenCalledWith("/api/views/staff", {});
  });

  it("hands back a payload its list's schema would refuse, for the views to set aside", async () => {
    const stale = { ...RECORD, payload: { sorting: "name" } };
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => [stale]),
    );
    expect(await useViewStorage("staff").load(service)).toEqual([stale]);
  });

  it("refuses an answer that is not the views", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [] })),
    );
    await expect(useViewStorage("staff").load(service)).rejects.toThrow();
  });

  it("saves a view under its id: its name and its payload, and nothing else of it", async () => {
    const fetch = vi.fn(async () => RECORD);
    vi.stubGlobal("$fetch", fetch);
    await useViewStorage<typeof PAYLOAD>("staff").save(
      { ...VIEW, payload: PAYLOAD },
      service,
    );
    expect(fetch).toHaveBeenCalledWith(`/api/views/staff/${ID}`, {
      method: "PUT",
      body: { name: "Elders", payload: PAYLOAD },
    });
  });

  it("removes a view by its id", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    await useViewStorage("staff").remove({ ...VIEW, payload: {} }, service);
    expect(fetch).toHaveBeenCalledWith(`/api/views/staff/${ID}`, {
      method: "DELETE",
    });
  });

  it("passes on what the API refuses", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("That view is not yours to save");
      }),
    );
    await expect(
      useViewStorage("staff").save({ ...VIEW, payload: {} }, service),
    ).rejects.toThrow("not yours");
  });
});

describe("useViewsRequest", () => {
  it("loads the views for the page they sit on", async () => {
    const init = vi.fn(async () => true);
    const { data } = await useViewsRequest({ id: "staff", init });
    expect(init).toHaveBeenCalledTimes(1);
    expect(data.value).toBe(true);
  });
});
