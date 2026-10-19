import { staffRecord } from "@bbf/schema";
import { describe, expect, it, vi } from "vitest";

import { setRoutePath } from "#imports";
import { STAFF } from "#test/support/records";
import { useRecord } from "~/composables/records";

const useStaff = () =>
  useRecord("staff", (id) => `/api/staff/${id}`, staffRecord);

describe("useRecord", () => {
  it("resolves the record the route names, by id", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath("/staff/1", { id: "1" });
    const { data } = await useStaff();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {});
    expect(data.value).toEqual(STAFF);
  });

  it("resolves nothing for an id that is not one, without asking", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    for (const id of ["jane-doe", "0", "1.5", ""]) {
      setRoutePath(`/staff/${id}`, { id });
      expect((await useStaff()).data.value, id).toBeNull();
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("resolves nothing for an id no record has", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    setRoutePath("/staff/9", { id: "9" });
    expect((await useStaff()).data.value).toBeNull();
  });

  it("refuses an answer that is not the record, and passes any other failure on", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ ...STAFF, id: "1" })),
    );
    setRoutePath("/staff/1", { id: "1" });
    await expect(useStaff()).rejects.toThrow();

    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("down"), { status: 500 });
      }),
    );
    await expect(useStaff()).rejects.toThrow("down");
  });
});
