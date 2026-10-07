import { afterEach, describe, expect, it, vi } from "vitest";

import { setContentPages, setRoutePath, useHead, useNuxtApp } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import SermonCard from "~/components/SermonCard.vue";
import SermonGrid from "~/components/SermonGrid.vue";
import Page from "~/pages/sermons.vue";
import { mountSuspended } from "#test/support/mount";

const SERMONS_PAGE = { path: "/sermons", title: "Sermons – Test Church" };

const sermon = (id: string) => ({
  id,
  title: `Sermon ${id}`,
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: `https://i4.ytimg.com/vi/${id}/hqdefault.jpg`,
});

const SERMONS = [sermon("abc123"), sermon("def456"), sermon("ghi789")];

const mountPage = async (sermons = SERMONS) => {
  vi.stubGlobal(
    "$fetch",
    vi.fn(async () => sermons),
  );
  setContentPages({ "/sermons": SERMONS_PAGE });
  return mountSuspended(Page);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sermons page", () => {
  it("heads the page with its title and description", async () => {
    const { wrapper } = await mountPage();
    const { $t } = useNuxtApp();
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: $t.sermons.title(),
      description: $t.sermons.description(),
    });
  });

  it("features the newest sermon in the header", async () => {
    const { wrapper } = await mountPage();
    const cards = wrapper
      .findComponent(PageHeader)
      .findAllComponents(SermonCard);
    expect(cards.map((card) => card.props())).toEqual([
      { sermon: SERMONS[0], featured: true },
    ]);
  });

  it("lists the rest of the sermons under the header", async () => {
    const { wrapper } = await mountPage();
    const grid = wrapper.find(".sermons > .page-header + .sermon-grid");
    expect(grid.exists()).toBe(true);
    expect(wrapper.findComponent(SermonGrid).props("sermons")).toEqual(
      SERMONS.slice(1),
    );
  });

  it("keeps the header and the channel link when there are no sermons", async () => {
    const { wrapper } = await mountPage([]);
    expect(wrapper.find(".page-header-slot").exists()).toBe(false);
    expect(wrapper.findComponent(SermonCard).exists()).toBe(false);
    expect(wrapper.findComponent(SermonGrid).props("sermons")).toEqual([]);
  });

  it("titles the document after the page, whatever locale the route is in", async () => {
    setRoutePath("/es/sermons");
    await mountPage();
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Sermons – Test Church",
    });
  });

  it("throws a 404 when the page does not exist", async () => {
    const { wrapper, error } = await mountSuspended(Page);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.find(".sermons").exists()).toBe(false);
  });
});
