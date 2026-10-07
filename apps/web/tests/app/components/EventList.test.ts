import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { ChurchEvent } from "#shared/types/events";

import { setRoutePath, useNuxtApp } from "#imports";
import EventList from "~/components/EventList.vue";

const mountList = (events: ChurchEvent[]) =>
  mount(EventList, { props: { events } });

/** Each listed event's words, part by part, with every space a plain one. */
const listed = (events: ChurchEvent[]) =>
  mountList(events)
    .findAll(".event-list > ol > li")
    .map((item) =>
      item.findAll(":scope > *").map((part) => part.text().replace(/\s/g, " ")),
    );

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

  it("links each title to the event's page, in the route's locale", () => {
    const event = { title: "Men’s Breakfast & Bible Study", start: "07:00" };
    expect(mountList([event]).find("h3 > a").attributes("href")).toBe(
      "/events/mens-breakfast-bible-study",
    );
    setRoutePath("/es/events");
    expect(
      mountList([{ ...event, slug: "mens-breakfast" }])
        .find("h3 > a")
        .attributes("href"),
    ).toBe("/es/events/mens-breakfast");
  });

  it("says so when there are no events, in the same card", () => {
    const wrapper = mountList([]);
    expect(wrapper.find("ol").exists()).toBe(false);
    expect(wrapper.find(".event-list > p.event-list-none").text()).toBe(
      useNuxtApp().$t.events.none(),
    );
  });

  it("writes the time in the route's locale", () => {
    setRoutePath("/es/events");
    expect(listed([{ title: "Cena", start: "17:30" }])).toEqual([
      ["Cena", "17:30"],
    ]);
  });
});
