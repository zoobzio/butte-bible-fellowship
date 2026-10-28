import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { ChurchEvent } from "@bbf/schema/types";

import { setLocale, useNuxtApp } from "#imports";
import EventList from "~/components/EventList.vue";

const mountList = (events: ChurchEvent[]) =>
  mount(EventList, { props: { events } });

const listed = (events: ChurchEvent[]) =>
  mountList(events)
    .findAll(".event-list > ol > li")
    .map((item) => item.findAll(":scope > *").map((part) => part.text()));

describe("EventList", () => {
  it("lists each event with its title, when it is held, and its note", () => {
    expect(
      listed([
        {
          title: "Worship Service",
          day: "sunday",
          start: "10:00",
          end: "11:30",
        },
        { title: "Harvest Dinner", start: "17:30" },
        { title: "Prayer Meeting", note: "All welcome", start: "10:00" },
        { title: "Open House", start: "all day" },
      ]),
    ).toEqual([
      ["Worship Service", "10:00 – 11:30 AM"],
      ["Harvest Dinner", "5:30 PM"],
      ["Prayer Meeting", "10:00 AM", "All welcome"],
      ["Open House"],
    ]);
  });

  it("titles each event in a heading, and sets its time after it", () => {
    const item = mountList([{ title: "Harvest Dinner", start: "17:30" }]).find(
      "li",
    );
    expect(item.find("h3").text()).toBe("Harvest Dinner");
    expect(item.find("h3 + p.event-list-time").exists()).toBe(true);
  });

  it("links each title to the event's page, by its slug or its title", () => {
    const event = { title: "Men’s Breakfast & Bible Study", start: "07:00" };
    expect(mountList([event]).find("h3 > a").attributes("href")).toBe(
      "/events/mens-breakfast-bible-study",
    );
    expect(
      mountList([{ ...event, slug: "mens-breakfast" }])
        .find("h3 > a")
        .attributes("href"),
    ).toBe("/events/mens-breakfast");
  });

  it("says so when there are no events, in the same card", () => {
    const wrapper = mountList([]);
    expect(wrapper.find("ol").exists()).toBe(false);
    expect(wrapper.find(".event-list > p.event-list-none").text()).toBe(
      useNuxtApp().$t.events.none(),
    );
  });

  it("writes the time in the reader's language", () => {
    setLocale("es");
    expect(listed([{ title: "Cena", start: "17:30" }])).toEqual([
      ["Cena", "17:30"],
    ]);
  });
});
