import type { InvitationConfig } from "~/types/invitation";

import { beforeEach, describe, expect, it } from "vitest";

import {
  queriedCollections,
  setAppConfig,
  setContentPages,
  setRoutePath,
  useNuxtApp,
} from "#imports";
import AppInvitation from "~/components/AppInvitation.vue";
import EventSchedule from "~/components/EventSchedule.vue";
import { mountSuspended } from "#test/support/mount";

const INVITATION: InvitationConfig = {
  address: "1 Test Street, Testville",
};

const WORSHIP = { title: "Worship Service", day: "sunday", start: "10:00" };
const SCHOOL = { title: "Sunday School", day: "sunday", start: "08:45" };
const PRAYER = { title: "Prayer Meeting", day: "thursday", start: "10:00" };
// Held once, on a Sunday.
const DINNER = { title: "Harvest Dinner", date: "2026-10-18", start: "17:30" };

const EVENTS_PAGE = {
  path: "/events",
  title: "Events – Test Church",
  events: [PRAYER, DINNER, WORSHIP, SCHOOL],
};

const { $t } = useNuxtApp();

const mountAt = async (
  path = "/",
  pages: Record<string, unknown> = { "/events": EVENTS_PAGE },
) => {
  setRoutePath(path);
  setContentPages(pages);
  const { wrapper } = await mountSuspended(AppInvitation);
  return wrapper;
};

beforeEach(() => {
  setAppConfig({ invitation: INVITATION });
});

describe("AppInvitation", () => {
  it("invites the reader to the service, and says where it is held", async () => {
    const words = (await mountAt()).find(
      "aside.site-invitation p.site-invitation-words",
    );
    expect(words.find("strong").text()).toBe($t.invitation.title());
    expect(words.text()).toBe(
      `${$t.invitation.title()} 1 Test Street, Testville`,
    );
  });

  it("lists what happens on a Sunday beside the words, from the earliest start", async () => {
    const wrapper = await mountAt();
    const schedule = wrapper.find(
      ".site-invitation-words + .site-invitation-schedule",
    );
    expect(schedule.find("p").text()).toBe($t.invitation.sundays());
    expect(schedule.findComponent(EventSchedule).props("events")).toEqual([
      SCHOOL,
      WORSHIP,
    ]);
  });

  it("is the same under every page, with no button leading away from it", async () => {
    for (const path of ["/", "/events", "/events/potluck", "/connect"]) {
      const wrapper = await mountAt(path);
      expect(wrapper.find(".cta").exists()).toBe(false);
      expect(wrapper.find(".site-invitation-words strong").text()).toBe(
        $t.invitation.title(),
      );
      expect(wrapper.findComponent(EventSchedule).exists()).toBe(true);
    }
  });

  it("reads the events in the visitor's locale", async () => {
    await mountAt("/es/connect");
    expect(queriedCollections).toEqual(["pages_es"]);
  });

  it("has an empty Sunday when the events cannot be read", async () => {
    const wrapper = await mountAt("/", {});
    expect(wrapper.findComponent(EventSchedule).props("events")).toEqual([]);
    expect(wrapper.find(".site-invitation-words").exists()).toBe(true);
  });
});
