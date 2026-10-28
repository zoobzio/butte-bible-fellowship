import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setLocale, useNuxtApp } from "#imports";
import SermonCard from "~/components/SermonCard.vue";

const SERMON = {
  slug: "faith-and-works",
  title: "Faith & Works",
  video: "abc123",
  date: "2026-10-04",
};

const THUMBNAIL = "https://i.ytimg.com/vi/abc123/hqdefault.jpg";

const card = (sermon = SERMON) => mount(SermonCard, { props: { sermon } });

describe("SermonCard", () => {
  it("shows the video's thumbnail behind a labelled play button, and no player", () => {
    const wrapper = card();
    const button = wrapper.find("button");
    expect(button.attributes("aria-label")).toBe(
      useNuxtApp().$t.sermons.play({ title: "Faith & Works" }),
    );
    expect(button.find("img").attributes()).toMatchObject({
      src: THUMBNAIL,
      alt: "",
      loading: "lazy",
    });
    expect(button.find("use").attributes("href")).toBe("#play");
    expect(wrapper.find("iframe").exists()).toBe(false);
  });

  it("shows the sermon's own picture over the video's when it has one", () => {
    const image = "https://cdn.example.com/sermons/faith-and-works.jpg";
    expect(
      card({ ...SERMON, image })
        .find("img")
        .attributes("src"),
    ).toBe(image);
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

  it("offers no player for a sermon not recorded, only its picture if any", () => {
    const image = "https://cdn.example.com/sermons/faith-and-works.jpg";
    const unrecorded = card({ ...SERMON, video: undefined, image });
    expect(unrecorded.find("button").exists()).toBe(false);
    expect(unrecorded.find("iframe").exists()).toBe(false);
    expect(unrecorded.find(".sermon-card-frame img").attributes("src")).toBe(
      image,
    );

    const bare = card({ ...SERMON, video: undefined });
    expect(bare.find(".sermon-card-frame").exists()).toBe(true);
    expect(bare.find("img").exists()).toBe(false);
  });

  it("titles the sermon and dates it by the day it was preached", () => {
    const wrapper = card();
    expect(wrapper.find("h2").text()).toBe("Faith & Works");
    const time = wrapper.find("time");
    expect(time.attributes("datetime")).toBe("2026-10-04");
    expect(time.text()).toBe("October 4, 2026");
  });

  it("names the speaker when the sermon does", () => {
    expect(card().find(".sermon-card-speaker").exists()).toBe(false);
    expect(
      card({ ...SERMON, speaker: "Pastor Name" })
        .find(".sermon-card-speaker")
        .text(),
    ).toBe("Pastor Name");
  });

  it("is not featured unless it is asked to be", () => {
    const wrapper = card();
    expect(wrapper.find(".sermon-card-featured").exists()).toBe(false);
    expect(wrapper.find(".sermon-card-label").exists()).toBe(false);
  });

  it("labels a featured sermon as the latest, and loads its picture at once", () => {
    const wrapper = mount(SermonCard, {
      props: { sermon: SERMON, featured: true },
    });
    const meta = wrapper.find(".sermon-card-featured > .sermon-card-meta");
    expect(meta.find(".sermon-card-label").text()).toBe(
      useNuxtApp().$t.sermons.latest(),
    );
    expect(meta.find("h2").text()).toBe("Faith & Works");
    expect(wrapper.find("img").attributes("loading")).toBe("eager");
  });

  it("writes the date in the reader's language", () => {
    setLocale("es");
    expect(card().find("time").text()).toBe("4 de octubre de 2026");
  });
});
