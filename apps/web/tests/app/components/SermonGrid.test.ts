import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { useNuxtApp } from "#imports";
import SermonCard from "~/components/SermonCard.vue";
import SermonGrid from "~/components/SermonGrid.vue";

const sermon = (id: string) => ({
  id,
  title: `Sermon ${id}`,
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: `https://i4.ytimg.com/vi/${id}/hqdefault.jpg`,
});

const SERMONS = [sermon("abc123"), sermon("def456")];

const grid = (sermons = SERMONS) => mount(SermonGrid, { props: { sermons } });

describe("SermonGrid", () => {
  it("renders a card for each sermon, in the order they are listed", () => {
    expect(
      grid()
        .findAllComponents(SermonCard)
        .map((card) => card.props()),
    ).toEqual(SERMONS.map((sermon) => ({ sermon, featured: false })));
  });

  it("links to the channel's sermons on YouTube, in a new tab", () => {
    const link = grid().find("a.cta");
    expect(link.attributes("href")).toBe(
      "https://www.youtube.com/channel/UCtest/videos",
    );
    expect(link.attributes("target")).toBe("_blank");
    expect(link.text()).toBe(useNuxtApp().$t.sermons.all());
  });

  it("keeps the link, and no list, when there are no sermons", () => {
    const wrapper = grid([]);
    expect(wrapper.find(".sermon-grid-list").exists()).toBe(false);
    expect(wrapper.find("a.cta").exists()).toBe(true);
  });
});
