import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useStaff } from "~~/server/composables/staff";

const BIO = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Has served since 2010." }],
    },
  ],
};

const ROW = {
  id: 1,
  name: "Jane Doe",
  role: "elder" as const,
  summary: "Has served since 2010.",
  bio: null,
  photo: null,
  email: "jane@example.com",
  phone: null,
};

const list = vi.fn(async () => [ROW, { ...ROW, id: 2, bio: BIO }]);

Object.assign(service, { web: { staff: { list } } });

afterEach(() => {
  list.mockClear();
});

describe("useStaff", () => {
  it("lists the staff as the API serves them, what a row has null in left out", async () => {
    expect(await useStaff().list()).toEqual([
      {
        id: 1,
        name: "Jane Doe",
        role: "elder",
        summary: "Has served since 2010.",
        email: "jane@example.com",
      },
      {
        id: 2,
        name: "Jane Doe",
        role: "elder",
        summary: "Has served since 2010.",
        bio: BIO,
        email: "jane@example.com",
      },
    ]);
    expect(list).toHaveBeenCalledTimes(1);
  });
});
