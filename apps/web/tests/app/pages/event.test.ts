import type { VueWrapper } from "@vue/test-utils";

import { describe, expect, it } from "vitest";

import { ContentRenderer } from "#components";
import {
  setAppConfig,
  setContentPages,
  setRoutePath,
  useHead,
  useNuxtApp,
} from "#imports";
import EventDetails from "~/components/EventDetails.vue";
import PageHeader from "~/components/PageHeader.vue";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import Page from "~/pages/events/[event].vue";
import { mountSuspended } from "#test/support/mount";

const EVENTS_PAGE = {
  path: "/events",
  title: "Events – Test Church",
  events: [
    { title: "Worship Service", day: "sunday", start: "10:00" },
    {
      title: "Reunión de Oración",
      slug: "prayer-meeting",
      note: "All welcome",
      day: "thursday",
      weeks: [1, 3],
      start: "10:00",
      end: "11:00",
    },
    { title: "Harvest Dinner", date: "2026-10-14", start: "17:30" },
    { title: "Open House", day: "saturday", start: "all day" },
  ],
};

// What is written about the worship service: the other events have no page.
const WORSHIP_PAGE = {
  path: "/events/worship-service",
  title: "Worship Service – Test Church",
  body: { type: "minimark", value: [["p", {}, "We gather to worship."]] },
};

const mountPage = async (path: string, written: object = WORSHIP_PAGE) => {
  setAppConfig({
    contact: {
      address: "1 Test Street, Testville",
      phone: "555-010-0199",
      email: "office@example.org",
    },
    events: { image: "/images/church.jpg" },
  });
  setContentPages({
    "/events": EVENTS_PAGE,
    "/events/worship-service": written,
  });
  setRoutePath(path);
  return mountSuspended(Page);
};

/** The header's props, every space a plain one: a formatter sets narrow
 * ones about a time. */
const header = (wrapper: VueWrapper) => {
  const props = wrapper.findComponent(PageHeader).props();
  return {
    ...props,
    description: props.description?.replace(/\s/g, " "),
  };
};

describe("event page", () => {
  it("heads the page with the event its address names", async () => {
    const { wrapper } = await mountPage("/events/worship-service");
    expect(header(wrapper)).toEqual({
      title: "Worship Service",
      description: "Every Sunday · 10:00 AM",
      back: useNuxtApp().$t.page.back(),
    });
  });

  it("titles the document after the event's own page, or after the event", async () => {
    await mountPage("/events/worship-service");
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Worship Service – Test Church",
    });

    useHead.mockClear();
    await mountPage("/events/harvest-dinner");
    expect(useHead.mock.calls[0]![0]()).toEqual({ title: "Harvest Dinner" });
  });

  it("finds an event by its own slug", async () => {
    const { wrapper } = await mountPage("/events/prayer-meeting");
    expect(header(wrapper).title).toBe("Reunión de Oración");
  });

  it("describes an event by its days, its time and its note", async () => {
    const { wrapper } = await mountPage("/events/prayer-meeting");
    expect(header(wrapper).description).toBe(
      "Every first and third Thursday · 10:00 – 11:00 AM · All welcome",
    );
  });

  it("describes an event held once by its date", async () => {
    const { wrapper } = await mountPage("/events/harvest-dinner");
    expect(header(wrapper).description).toBe("Wednesday, October 14 · 5:30 PM");
  });

  it("leaves out of the description what the event does not say", async () => {
    const { wrapper } = await mountPage("/events/open-house");
    expect(header(wrapper).description).toBe("Every Saturday");
  });

  it("offers the way back in its header", async () => {
    const { wrapper } = await mountPage("/es/events/prayer-meeting");
    const back = wrapper.find(".event > .page-header > a.page-header-back");
    expect(back.text()).toBe(useNuxtApp().$t.page.back());
    expect(back.attributes("href")).toBe("/es/events");
  });

  it("renders what is written about the event under its picture, whatever locale the route is in", async () => {
    const { wrapper } = await mountPage("/es/events/worship-service");
    const renderer = wrapper
      .find(
        ".event > .page-header + .event-body > .event-media + article.prose",
      )
      .findComponent(ContentRenderer);
    expect(renderer.props("value")).toEqual(WORSHIP_PAGE);
    expect(renderer.props("components")).toBe(MARKDOWN_COMPONENTS);
    expect(renderer.props("prose")).toBe(false);
  });

  it("shows the picture its page names, as decoration", async () => {
    const { wrapper } = await mountPage("/events/worship-service", {
      ...WORSHIP_PAGE,
      image: "/images/worship.jpg",
    });
    const picture = wrapper.find(".event-media > img");
    expect(picture.attributes("src")).toBe("/images/worship.jpg");
    expect(picture.attributes("alt")).toBe("");
  });

  it("shows the church's picture until its page names one", async () => {
    const { wrapper } = await mountPage("/events/worship-service");
    expect(wrapper.find(".event-media > img").attributes("src")).toBe(
      "/images/church.jpg",
    );
  });

  it("has no article for an event nothing is written about, but the church's picture", async () => {
    const { wrapper } = await mountPage("/events/harvest-dinner");
    expect(
      wrapper.find(".event-body > .event-media > img").attributes("src"),
    ).toBe("/images/church.jpg");
    expect(wrapper.find(".prose").exists()).toBe(false);
    expect(wrapper.findComponent(ContentRenderer).exists()).toBe(false);
  });

  it("says what there is to know of the event beside it", async () => {
    const { wrapper } = await mountPage("/events/prayer-meeting");
    const details = wrapper
      .find(".event > .event-body + aside.event-aside")
      .findComponent(EventDetails);
    expect(details.props("event")).toEqual(EVENTS_PAGE.events[1]);
  });

  it("throws a 404 when no event has the slug", async () => {
    const { wrapper, error } = await mountPage("/events/nope");
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.find(".event").exists()).toBe(false);
  });

  it("throws a 404 when the events page does not exist", async () => {
    setRoutePath("/events/worship-service");
    const { error } = await mountSuspended(Page);
    expect(error).toMatchObject({ statusCode: 404 });
  });
});
