import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "#test/mocks/bezoar";
import { useStaff } from "~~/server/composables/staff";

/** A row as `web.staff.list` and `web.staff.fetch` return it. */
const ROW = {
  slug: "jane-doe",
  name: "Jane Doe",
  role: "Elder",
  summary: "Has served since 2010.",
  bio: null,
  photo: null,
  email: "jane@example.com",
  phone: null,
};

const list = vi.fn(async () => [ROW, { ...ROW, slug: "john-roe" }]);
const first = vi.fn(async (args: { slug: string }) =>
  args.slug === ROW.slug ? ROW : null,
);

// The service is the stub the module's shim keeps; the staff queries are
// given to it here, the shape the built service has them in.
Object.assign(service, { web: { staff: { list, fetch: { first } } } });

afterEach(() => {
  list.mockClear();
  first.mockClear();
});

describe("useStaff", () => {
  it("lists the staff as the API serves them, what a row has null in left out", async () => {
    expect(await useStaff().list()).toEqual([
      {
        slug: "jane-doe",
        name: "Jane Doe",
        role: "Elder",
        summary: "Has served since 2010.",
        email: "jane@example.com",
      },
      {
        slug: "john-roe",
        name: "Jane Doe",
        role: "Elder",
        summary: "Has served since 2010.",
        email: "jane@example.com",
      },
    ]);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("fetches one member by slug, or nothing", async () => {
    expect(await useStaff().fetch("jane-doe")).toMatchObject({
      slug: "jane-doe",
      name: "Jane Doe",
    });
    expect(first).toHaveBeenCalledWith({ slug: "jane-doe" });
    expect(await useStaff().fetch("nope")).toBeNull();
  });
});
