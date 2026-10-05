import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setRoutePath, useNuxtApp } from "#imports";
import SermonCard from "~/components/SermonCard.vue";

const SERMON = {
  id: "abc123",
  title: "Faith & Works",
  // Monday in UTC, still Sunday evening at the church.
  published: "2026-10-05T03:16:28+00:00",
  thumbnail: "https://i4.ytimg.com/vi/abc123/hqdefault.jpg",
};

const card = () => mount(SermonCard, { props: { sermon: SERMON } });

describe("SermonCard", () => {
  it("shows the sermon's thumbnail behind a labelled play button, and no player", () => {
    const wrapper = card();
    const button = wrapper.find("button");
    expect(button.attributes("aria-label")).toBe(
      useNuxtApp().$t.sermons.play({ title: "Faith & Works" }),
    );
    expect(button.find("img").attributes()).toMatchObject({
      src: SERMON.thumbnail,
      alt: "",
      loading: "lazy",
    });
    expect(button.find("use").attributes("href")).toBe("#play");
    expect(wrapper.find("iframe").exists()).toBe(false);
  });

  it("swaps the thumbnail for the playing sermon when the button is pressed", async () => {
    const wrapper = card();
    await wrapper.find("button").trigger("click");

    const frame = wrapper.find("iframe");
    expect(frame.attributes("src")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123?autoplay=1",
    );
    expect(frame.attributes("title")).toBe("Faith & Works");
    expect(frame.attributes("allow")).toContain("autoplay");
    expect(frame.attributes("allowfullscreen")).toBeDefined();
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("titles the sermon and dates it by the church's day", () => {
    const wrapper = card();
    expect(wrapper.find("h2").text()).toBe("Faith & Works");
    const time = wrapper.find("time");
    expect(time.attributes("datetime")).toBe(SERMON.published);
    expect(time.text()).toBe("October 4, 2026");
  });

  it("writes the date in the route's language", () => {
    setRoutePath("/es/sermons");
    expect(card().find("time").text()).toBe("4 de octubre de 2026");
  });
});
