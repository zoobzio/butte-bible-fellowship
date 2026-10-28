import { afterEach, describe, expect, it, vi } from "vitest";

import { useNuxtApp } from "#imports";
import HomeSermons from "~/components/HomeSermons.vue";
import SermonGrid from "~/components/SermonGrid.vue";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const sermon = (slug: string) => ({
  slug,
  title: `Sermon ${slug}`,
  video: slug,
  date: "2026-10-04",
});

const SERMONS = ["abc123", "def456", "ghi789", "jkl012"].map(sermon);

const { $t } = useNuxtApp();

const mountSermons = async (sermons = SERMONS) => {
  vi.stubGlobal(
    "$fetch",
    vi.fn(async () => sermons),
  );
  const { wrapper } = await mountSuspended(HomeSermons);
  return wrapper;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HomeSermons", () => {
  it("shows the three newest sermons under their heading", async () => {
    const wrapper = await mountSermons();
    expect(wrapper.find("section.home-sermons > h2").text()).toBe(
      $t.sermons.recent(),
    );
    expect(wrapper.findComponent(SermonGrid).props("sermons")).toEqual(
      SERMONS.slice(0, 3),
    );
  });

  it("links on to the sermons page in place of the channel", async () => {
    const wrapper = await mountSermons();
    const links = wrapper.findAll(".home-sermons a.cta");
    expect(links.map((link) => link.attributes("href"))).toEqual(["/sermons"]);
    expect(links[0]!.text()).toBe($t.sermons.more());
  });

  it("renders nothing when there are no sermons to show", async () => {
    const wrapper = await mountSermons([]);
    expect(wrapper.find(".home-sermons").exists()).toBe(false);
  });
});
