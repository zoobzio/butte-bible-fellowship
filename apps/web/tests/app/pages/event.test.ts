import { describe, expect, it } from "vitest";

import { setContentPages, setRoutePath, useHead, useNuxtApp } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
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
      start: "10:00",
    },
  ],
};

const mountPage = async (path: string) => {
  setContentPages({ "/events": EVENTS_PAGE });
  setRoutePath(path);
  return mountSuspended(Page);
};

describe("event page", () => {
  it("heads the page with the event its address names", async () => {
    const { wrapper } = await mountPage("/events/worship-service");
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Worship Service",
      description: undefined,
    });
    expect(useHead.mock.calls[0]![0]()).toEqual({ title: "Worship Service" });
  });

  it("finds an event by its own slug, and describes it with its note", async () => {
    const { wrapper } = await mountPage("/events/prayer-meeting");
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Reunión de Oración",
      description: "All welcome",
    });
  });

  it("links back to every event, in the route's locale", async () => {
    const { wrapper } = await mountPage("/es/events/prayer-meeting");
    const link = wrapper.find(".event > .page-header + a.cta");
    expect(link.text()).toBe(useNuxtApp().$t.events.all());
    expect(link.attributes("href")).toBe("/es/events");
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
