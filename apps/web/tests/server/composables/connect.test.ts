import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useConnect } from "~~/server/composables/connect";

const ROW = {
  title: "Connect",
  description: "We’d love to meet you." as string | null,
  address: "1 Test Street, Testville",
  phone: "555-010-0100" as string | null,
  fax: null as string | null,
  email: null as string | null,
  hours: "Friday: 9am–noon" as string | null,
  body: null,
};

const first = vi.fn(async (): Promise<typeof ROW | null> => ROW);

Object.assign(service, { web: { connect: { fetch: { first } } } });

afterEach(() => {
  first.mockClear();
});

describe("useConnect", () => {
  it("reads the connect page as a document: its header and how to reach the church as its front matter", async () => {
    expect(await useConnect().fetch()).toEqual({
      type: "root",
      data: {
        matter: {
          title: "Connect",
          description: "We’d love to meet you.",
          address: "1 Test Street, Testville",
          phone: "555-010-0100",
          hours: "Friday: 9am–noon",
        },
      },
      children: [],
    });
    expect(first).toHaveBeenCalledWith();
  });

  it("reads nothing when the table holds no row", async () => {
    first.mockResolvedValueOnce(null);
    expect(await useConnect().fetch()).toBeNull();
  });
});
