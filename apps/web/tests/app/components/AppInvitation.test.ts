import type { InvitationConfig } from "~/types/invitation";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import {
  queriedCollections,
  setAppConfig,
  setContentPages,
  setRoutePath,
  useNuxtApp,
} from "#imports";
import AppInvitation from "~/components/AppInvitation.vue";
import EventWeek from "~/components/EventWeek.vue";
import StaffCard from "~/components/StaffCard.vue";
import { mountSuspended } from "#test/support/mount";

const INVITATION: InvitationConfig = {
  address: "1 Test Street, Testville",
};

const WORSHIP = { title: "Worship Service", day: "sunday", start: "10:00" };
const PRAYER = { title: "Prayer Meeting", day: "thursday", start: "10:00" };
// Held once, the week after the one the tests are in.
const DINNER = { title: "Harvest Dinner", date: "2026-10-14", start: "17:30" };

const EVENTS_PAGE = {
  path: "/events",
  title: "Events – Test Church",
  events: [PRAYER, DINNER, WORSHIP],
};

const STAFF = [
  { name: "Jane Doe", role: "Elder", bio: "Has served since 2010." },
  { name: "John Roe", role: "Pastor" },
];

const CONNECT_PAGE = {
  path: "/connect",
  title: "Connect – Test Church",
  staff: STAFF,
};

const { $t } = useNuxtApp();

const mountAt = async (
  path = "/",
  pages: Record<string, unknown> = {
    "/events": EVENTS_PAGE,
    "/connect": CONNECT_PAGE,
  },
) => {
  setRoutePath(path);
  setContentPages(pages);
  const { wrapper } = await mountSuspended(AppInvitation);
  return wrapper;
};

beforeEach(() => {
  setAppConfig({ invitation: INVITATION });
  // A Tuesday at the church: its week is Sunday the 4th to Saturday the 10th.
  vi.useFakeTimers({
    now: new Date("2026-10-06T19:00:00Z"),
    toFake: ["Date"],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AppInvitation", () => {
  it("invites the reader to the service, and says where it is held", async () => {
    const words = (await mountAt()).find(
      "aside.site-invitation .site-invitation-words > p",
    );
    expect(words.find("strong").text()).toBe($t.invitation.title());
    expect(words.text()).toBe(
      `${$t.invitation.title()} 1 Test Street, Testville`,
    );
  });

  it("leads on to the events page, under the words, from every page but the events page", async () => {
    for (const path of ["/", "/connect", "/events/potluck"]) {
      const links = (await mountAt(path)).findAll(
        ".site-invitation-words > p + a.cta",
      );
      expect(links.map((link) => link.attributes("href"))).toEqual(["/events"]);
      expect(links[0]!.text()).toBe($t.invitation.events());
    }
  });

  it("lists this week's days beside the words, each with the events held on it", async () => {
    const wrapper = await mountAt("/about-us");
    const week = wrapper.find(".site-invitation-words + .site-invitation-week");
    expect(week.find("p").text()).toBe($t.invitation.week());
    expect(week.findComponent(EventWeek).props("days")).toEqual([
      { date: "2026-10-04", events: [WORSHIP] },
      { date: "2026-10-05", events: [] },
      { date: "2026-10-06", events: [] },
      { date: "2026-10-07", events: [] },
      { date: "2026-10-08", events: [PRAYER] },
      { date: "2026-10-09", events: [] },
      { date: "2026-10-10", events: [] },
    ]);
  });

  it("names no staff beside the week", async () => {
    const wrapper = await mountAt("/about-us");
    expect(wrapper.find(".site-invitation-staff").exists()).toBe(false);
    expect(wrapper.findComponent(StaffCard).exists()).toBe(false);
  });

  it("invites the reader to get in touch, and on to the connect page, under the events page", async () => {
    const wrapper = await mountAt("/events");
    const words = wrapper.find(".site-invitation-words > p");
    expect(words.find("strong").text()).toBe($t.invitation.meet());
    expect(words.text()).toBe(
      `${$t.invitation.meet()} ${$t.invitation.people()}`,
    );

    const links = wrapper.findAll(".site-invitation-words > p + a.cta");
    expect(links.map((link) => link.attributes("href"))).toEqual(["/connect"]);
    expect(links[0]!.text()).toBe($t.invitation.connect());
  });

  it("lists the staff, compactly, where the week was under the events page", async () => {
    const wrapper = await mountAt("/events");
    expect(wrapper.findComponent(EventWeek).exists()).toBe(false);

    const staff = wrapper.find(
      ".site-invitation-words + .site-invitation-staff",
    );
    expect(staff.find("p.site-invitation-label").text()).toBe(
      $t.invitation.staff(),
    );
    expect(
      staff.findAllComponents(StaffCard).map((card) => card.props()),
    ).toEqual(STAFF.map((member) => ({ member, compact: true })));
  });

  it("keeps the words and the link when there are no staff to list", async () => {
    const wrapper = await mountAt("/events", { "/events": EVENTS_PAGE });
    expect(wrapper.find(".site-invitation-staff").exists()).toBe(false);
    expect(wrapper.find("a.cta").attributes("href")).toBe("/connect");
  });

  it("turns from the week to the staff, and back, as the visitor moves between pages", async () => {
    const wrapper = await mountAt("/sermons");
    expect(wrapper.findComponent(EventWeek).exists()).toBe(true);

    setRoutePath("/events");
    await nextTick();
    expect(wrapper.findComponent(EventWeek).exists()).toBe(false);
    expect(wrapper.findAllComponents(StaffCard)).toHaveLength(STAFF.length);
    expect(wrapper.find("a.cta").attributes("href")).toBe("/connect");

    setRoutePath("/about-us");
    await nextTick();
    expect(wrapper.findComponent(EventWeek).exists()).toBe(true);
    expect(wrapper.find("a.cta").attributes("href")).toBe("/events");
  });

  it("reads the events and the staff, and keeps its link, in the visitor's locale", async () => {
    const wrapper = await mountAt("/es/connect");
    expect(queriedCollections).toEqual(["pages_es", "pages_es"]);
    expect(wrapper.find("a.cta").attributes("href")).toBe("/es/events");

    setRoutePath("/es/events");
    await nextTick();
    expect(wrapper.find("a.cta").attributes("href")).toBe("/es/connect");
  });

  it("has an empty week when the events cannot be read", async () => {
    const wrapper = await mountAt("/", {});
    expect(
      wrapper
        .findComponent(EventWeek)
        .props("days")
        .map((day: { events: unknown[] }) => day.events.length),
    ).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(wrapper.find("a.cta").exists()).toBe(true);
  });
});
