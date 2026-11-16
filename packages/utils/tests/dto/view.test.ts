import { viewRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toViewRecord } from "../../src/dto/view";

const ROW = {
  id: "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f",
  surface: "staff",
  name: "Elders",
  payload: { sorting: [{ id: "name", desc: true }], pageSize: 50 },
  created_at: new Date("2026-10-17T18:00:00.000Z"),
  updated_at: new Date("2026-10-18T09:30:00.000Z"),
};

describe("toViewRecord", () => {
  it("is a view as the admin reads it: every column, its dates as text", () => {
    const record = toViewRecord(ROW);
    expect(record).toEqual({
      id: ROW.id,
      surface: "staff",
      name: "Elders",
      payload: ROW.payload,
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(viewRecord.parse(record)).toEqual(record);
  });

  it("hands the payload on as it was stored, whatever its shape", () => {
    const record = toViewRecord({ ...ROW, payload: { sorting: "name" } });
    expect(record.payload).toEqual({ sorting: "name" });
  });
});
