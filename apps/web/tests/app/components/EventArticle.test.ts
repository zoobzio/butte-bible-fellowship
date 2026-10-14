import type { VueWrapper } from "@vue/test-utils";

import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { PageItem } from "~/types/page";

import type { ChurchEvent } from "@bbf/validators/types";

import { setAppConfig, setRoutePath, useNuxtApp } from "#imports";
import EventArticle from "~/components/EventArticle.vue";
import EventDetails from "~/components/EventDetails.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";

const WORSHIP: ChurchEvent = {
  title: "Worship Service",
  day: "sunday",
  start: "10:00",
};

const PRAYER: ChurchEvent = {
  title: "Reunión de Oración",
  slug: "prayer-meeting",
  note: "All welcome",
  day: "thursday",
  weeks: [1, 3],
  start: "10:00",
  end: "11:00",
};

const DINNER: ChurchEvent = {
  title: "Harvest Dinner",
  date: "2026-10-14",
  start: "17:30",
};

const OPEN_HOUSE: ChurchEvent = {
  title: "Open House",
  day: "saturday",
  start: "all day",
};

// What is written about the worship service.
const WORSHIP_PAGE = {
  path: "/events/worship-service",
  title: "Worship Service – Test Church",
  body: { type: "minimark", value: [["p", {}, "We gather to worship."]] },
} as unknown as PageItem;

const { $t } = useNuxtApp();

const mountArticle = (event: ChurchEvent, page: PageItem | null = null) =>
  mount(EventArticle, { props: { event, page } });

/** The header's props, every space a plain one: a formatter sets narrow
 * ones about a time. */
const header = (wrapper: VueWrapper) => {
  const props = wrapper.findComponent(PageHeader).props();
  return {
    ...props,
    description: props.description?.replace(/\s/g, " "),
  };
};

beforeEach(() => {
  setAppConfig({
    contact: {
      address: "1 Test Street, Testville",
      phone: "555-010-0199",
      email: "office@example.org",
    },
    events: { image: "/images/church.jpg" },
  });
  setRoutePath("/events/worship-service");
});

describe("EventArticle", () => {
  it("heads the page with the event, described by its days and its time", () => {
    expect(header(mountArticle(WORSHIP, WORSHIP_PAGE))).toEqual({
      title: "Worship Service",
      description: "Every Sunday · 10:00 AM",
      back: $t.page.back(),
    });
  });

  it("describes an event by its days, its time and its note", () => {
    expect(header(mountArticle(PRAYER)).description).toBe(
      "Every first and third Thursday · 10:00 – 11:00 AM · All welcome",
    );
  });

  it("describes an event held once by its date", () => {
    expect(header(mountArticle(DINNER)).description).toBe(
      "Wednesday, October 14 · 5:30 PM",
    );
  });

  it("leaves out of the description what the event does not say", () => {
    expect(header(mountArticle(OPEN_HOUSE)).description).toBe("Every Saturday");
  });

  it("offers the way back in its header", () => {
    setRoutePath("/es/events/prayer-meeting");
    const back = mountArticle(PRAYER).find(
      ".event > .page-header > a.page-header-back",
    );
    expect(back.text()).toBe($t.page.back());
    expect(back.attributes("href")).toBe("/es/events");
  });

  it("renders what is written about the event under its picture", () => {
    expect(
      mountArticle(WORSHIP, WORSHIP_PAGE)
        .find(
          ".event > .page-header + .event-body > .event-media + article.prose",
        )
        .findComponent(MarkdownBody)
        .props("page"),
    ).toEqual(WORSHIP_PAGE);
  });

  it("shows the picture its page names, as decoration", () => {
    const picture = mountArticle(WORSHIP, {
      ...WORSHIP_PAGE,
      image: "/images/worship.jpg",
    }).find(".event-media > img");
    expect(picture.attributes("src")).toBe("/images/worship.jpg");
    expect(picture.attributes("alt")).toBe("");
  });

  it("shows the church's picture until its page names one", () => {
    expect(
      mountArticle(WORSHIP, WORSHIP_PAGE)
        .find(".event-media > img")
        .attributes("src"),
    ).toBe("/images/church.jpg");
  });

  it("has no article for an event nothing is written about, but the church's picture", () => {
    const wrapper = mountArticle(DINNER);
    expect(
      wrapper.find(".event-body > .event-media > img").attributes("src"),
    ).toBe("/images/church.jpg");
    expect(wrapper.find(".prose").exists()).toBe(false);
    expect(wrapper.findComponent(MarkdownBody).exists()).toBe(false);
  });

  it("says what there is to know of the event beside it", () => {
    const details = mountArticle(PRAYER)
      .find(".event > .event-body + aside.event-aside")
      .findComponent(EventDetails);
    expect(details.props("event")).toEqual(PRAYER);
  });
});
