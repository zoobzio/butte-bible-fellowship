import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { ChurchEvent } from "@bbf/schema/types";

import { useNuxtApp } from "#imports";
import EventSchedule from "~/components/EventSchedule.vue";

const SUNDAY: ChurchEvent[] = [
  { title: "Sunday School", day: "sunday", start: "08:45", end: "09:30" },
  {
    title: "Worship Service",
    slug: "worship-service",
    day: "sunday",
    start: "10:00",
    end: "11:30",
  },
  { title: "Open House", day: "sunday", start: "all day" },
];

const mountSchedule = (events = SUNDAY) =>
  mount(EventSchedule, { props: { events } });

describe("EventSchedule", () => {
  it("lists each event, in the order it was handed, with when it is held", () => {
    expect(
      mountSchedule()
        .findAll("ol.event-schedule > li")
        .map((event) => event.findAll(":scope > *").map((part) => part.text())),
    ).toEqual([
      ["Sunday School", "8:45 – 9:30 AM"],
      ["Worship Service", "10:00 – 11:30 AM"],
      ["Open House"],
    ]);
  });

  it("titles each event with a link to its page, and sets its time after it", () => {
    const [, worship] = mountSchedule().findAll("li");
    expect(worship!.find("a").text()).toBe("Worship Service");
    expect(worship!.find("a + span.event-schedule-time").exists()).toBe(true);
  });

  it("links each event to its page", () => {
    const [, worship] = mountSchedule().findAll("li");
    expect(worship!.find("a").attributes("href")).toBe(
      "/events/worship-service",
    );
  });

  it("says so when nothing is held", () => {
    const wrapper = mountSchedule([]);
    expect(wrapper.find("ol").exists()).toBe(false);
    expect(wrapper.find("p.event-schedule-none").text()).toBe(
      useNuxtApp().$t.events.none(),
    );
  });
});
