import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useHome } from "~~/server/composables/home";

const PARAGRAPH = {
  type: "element",
  tagName: "p",
  properties: {},
  children: [{ type: "text", value: "Welcome." }],
};

const ROW = {
  title: "Test Church",
  description: "A church.",
  hero_heading: "Discover **Love**",
  hero_description: "Join us.",
  hero_action: "Learn More",
  hero_link: "/about-us",
  hero_image: "https://cdn.example.com/home/1.jpg",
  body: { type: "root", children: [PARAGRAPH] },
};

const first = vi.fn(async (): Promise<typeof ROW | null> => ROW);

Object.assign(service, { web: { home: { fetch: { first } } } });

afterEach(() => {
  first.mockClear();
});

describe("useHome", () => {
  it("reads the home page as a document: its hero in its front matter, over what is written", async () => {
    expect(await useHome().fetch()).toEqual({
      type: "root",
      data: {
        matter: {
          title: "Test Church",
          description: "A church.",
          hero: {
            heading: "Discover **Love**",
            description: "Join us.",
            action: "Learn More",
            link: "/about-us",
            image: "https://cdn.example.com/home/1.jpg",
          },
        },
      },
      children: [PARAGRAPH],
    });
    expect(first).toHaveBeenCalledWith();
  });

  it("reads nothing when the table holds no row", async () => {
    first.mockResolvedValueOnce(null);
    expect(await useHome().fetch()).toBeNull();
  });
});
