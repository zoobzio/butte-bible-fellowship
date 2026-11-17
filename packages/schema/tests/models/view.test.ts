import { describe, expect, it } from "vitest";

import { viewRecord, viewRecords, viewSurface } from "../../src/models/view";

const VIEW = {
  id: "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f",
  surface: "staff",
  name: "Elders",
  payload: { sorting: [{ id: "name", desc: true }], pageSize: 50 },
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("viewSurface", () => {
  it("names a list of the admin that has views, and no other", () => {
    expect(viewSurface.parse("staff")).toBe("staff");
    expect(viewSurface.parse("content")).toBe("content");
    expect(viewSurface.safeParse("sermons").success).toBe(false);
  });
});

describe("viewRecord", () => {
  it("accepts a view as it was stored", () => {
    expect(viewRecord.parse(VIEW)).toEqual(VIEW);
  });

  it("needs an id that is a UUID, a list, a name and its dates", () => {
    for (const key of ["id", "surface", "name", "createdAt", "updatedAt"]) {
      const { [key]: _, ...rest } = VIEW as Record<string, unknown>;
      expect(viewRecord.safeParse(rest).success, key).toBe(false);
    }
    expect(viewRecord.safeParse({ ...VIEW, id: "elders" }).success).toBe(false);
  });

  it("holds the payload to no shape: a view saved before its list changed still reads", () => {
    const stale = { ...VIEW, payload: { sorting: "name" } };
    expect(viewRecord.parse(stale)).toEqual(stale);
  });
});

describe("viewRecords", () => {
  it("is the views of one list, or none", () => {
    expect(viewRecords.parse([VIEW])).toEqual([VIEW]);
    expect(viewRecords.parse([])).toEqual([]);
  });
});
