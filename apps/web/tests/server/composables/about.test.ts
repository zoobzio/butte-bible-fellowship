import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useAbout } from "~~/server/composables/about";

const ROW = {
  title: "About Us",
  description: "A clean canvas." as string | null,
  body: null,
};

const first = vi.fn(async (): Promise<typeof ROW | null> => ROW);

Object.assign(service, { web: { about: { fetch: { first } } } });

afterEach(() => {
  first.mockClear();
});

describe("useAbout", () => {
  it("reads About Us as a document: the title and description it opens with as its front matter", async () => {
    expect(await useAbout().fetch()).toEqual({
      type: "root",
      data: {
        matter: { title: "About Us", description: "A clean canvas." },
      },
      children: [],
    });
    expect(first).toHaveBeenCalledWith();
  });

  it("reads nothing when the table holds no row", async () => {
    first.mockResolvedValueOnce(null);
    expect(await useAbout().fetch()).toBeNull();
  });
});
