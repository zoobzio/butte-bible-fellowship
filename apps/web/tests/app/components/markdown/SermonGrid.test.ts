import { afterEach, describe, expect, it, vi } from "vitest";

import { useNuxtApp } from "#imports";
import SermonCard from "~/components/SermonCard.vue";
import SermonGrid from "~/components/markdown/SermonGrid.vue";
import { mountSuspended } from "#test/support/mount";

const sermon = (id: string) => ({
  id,
  title: `Sermon ${id}`,
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: `https://i4.ytimg.com/vi/${id}/hqdefault.jpg`,
});

const SERMONS = [sermon("abc123"), sermon("def456")];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SermonGrid", () => {
  it("renders a card for each sermon, in the order they are listed", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => SERMONS),
    );
    const { wrapper } = await mountSuspended(SermonGrid);
    expect(
      wrapper.findAllComponents(SermonCard).map((card) => card.props("sermon")),
    ).toEqual(SERMONS);
  });

  it("links to the channel's sermons on YouTube, in a new tab", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => SERMONS),
    );
    const { wrapper } = await mountSuspended(SermonGrid);
    const link = wrapper.find("a.cta");
    expect(link.attributes("href")).toBe(
      "https://www.youtube.com/channel/UCtest/videos",
    );
    expect(link.attributes("target")).toBe("_blank");
    expect(link.text()).toBe(useNuxtApp().$t.sermons.all());
  });

  it("keeps the link, and no list, when the sermons cannot be read", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("feed unavailable");
      }),
    );
    const { wrapper } = await mountSuspended(SermonGrid);
    expect(wrapper.find(".sermon-grid-list").exists()).toBe(false);
    expect(wrapper.find("a.cta").exists()).toBe(true);
  });
});
