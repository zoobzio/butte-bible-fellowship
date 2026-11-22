import { personRecord } from "@bbf/schema";
import { describe, expect, it, vi } from "vitest";

import { setRoutePath } from "#imports";
import { PERSON } from "#test/support/records";
import { useRecord } from "~/composables/records";

const usePeople = () =>
  useRecord("people", (id) => `/api/people/${id}`, personRecord);

describe("useRecord", () => {
  it("resolves the record the route names, by id", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath("/people/1", { id: "1" });
    const { data } = await usePeople();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {});
    expect(data.value).toEqual(PERSON);
  });

  it("resolves nothing for an id that is not one, without asking", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    for (const id of ["jane-doe", "0", "1.5", ""]) {
      setRoutePath(`/people/${id}`, { id });
      expect((await usePeople()).data.value, id).toBeNull();
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
    setRoutePath("/people/9", { id: "9" });
    expect((await usePeople()).data.value).toBeNull();
  });

  it("refuses an answer that is not the record, and passes any other failure on", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ ...PERSON, id: "1" })),
    );
    setRoutePath("/people/1", { id: "1" });
    await expect(usePeople()).rejects.toThrow();

    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("down"), { status: 500 });
      }),
    );
    await expect(usePeople()).rejects.toThrow("down");
  });
});
