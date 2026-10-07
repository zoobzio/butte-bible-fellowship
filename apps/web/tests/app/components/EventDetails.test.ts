import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { ChurchEvent } from "#shared/types/events";

import { setAppConfig, setRoutePath, useNuxtApp } from "#imports";
import EventDetails from "~/components/EventDetails.vue";

const CONTACT = {
  address: "1 Test Street, Testville",
  phone: "555-010-0199",
  email: "office@example.org",
};

const WORSHIP: ChurchEvent = {
  title: "Worship Service",
  day: "sunday",
  start: "10:00",
  end: "11:30",
};

const { $t } = useNuxtApp();

/** Each section's label and lines, with every space a plain one. */
const sections = (event: ChurchEvent) =>
  mount(EventDetails, { props: { event } })
    .findAll("dl.event-details > div")
    .map((section) =>
      section.findAll(":scope > *").map((part) => ({
        tag: part.element.tagName.toLowerCase(),
        text: part.text().replace(/\s/g, " "),
      })),
    );

beforeEach(() => {
  setAppConfig({ contact: CONTACT });
});

describe("EventDetails", () => {
  it("says when and where the event is held, and who to ask about it", () => {
    expect(sections(WORSHIP)).toEqual([
      [
        { tag: "dt", text: $t.events.when() },
        { tag: "dd", text: "Every Sunday" },
        { tag: "dd", text: "10:00 – 11:30 AM" },
      ],
      [
        { tag: "dt", text: $t.events.where() },
        { tag: "dd", text: "1 Test Street, Testville" },
      ],
      [
        { tag: "dt", text: $t.events.questions() },
        { tag: "dd", text: "555-010-0199" },
        { tag: "dd", text: "office@example.org" },
      ],
    ]);
  });

  it("says where an event with a place of its own is held", () => {
    const [, where] = sections({ ...WORSHIP, location: "Bidwell Park" });
    expect(where![1]).toEqual({ tag: "dd", text: "Bidwell Park" });
  });

  it("says only as much of when as the event does", () => {
    const [when] = sections({
      title: "Open House",
      start: "all day",
      day: "saturday",
    });
    expect(when!.map((part) => part.text)).toEqual([
      $t.events.when(),
      "Every Saturday",
    ]);
  });

  it("leaves out when for an event that says neither its days nor its time", () => {
    const labels = sections({ title: "Open House", start: "all day" }).map(
      (section) => section[0]!.text,
    );
    expect(labels).toEqual([$t.events.where(), $t.events.questions()]);
  });

  it("links the phone number to call and the email to write to", () => {
    const links = mount(EventDetails, { props: { event: WORSHIP } }).findAll(
      ".event-details-questions a",
    );
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "tel:5550100199",
      "mailto:office@example.org",
    ]);
  });

  it("says when in the route's locale", () => {
    setRoutePath("/es/events/worship-service");
    const [when] = sections(WORSHIP);
    expect(when![1]!.text).toContain("domingo");
  });
});
