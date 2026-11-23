import type { EventRecord, ViewRecord } from "@bbf/schema/types";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Calendar, Dialog, Editor, NuxtPage, Views } from "#components";
import { eventViewBody } from "@bbf/schema";
import { setRoutePath, useRouter } from "#imports";
import EventBody from "~/components/EventBody.vue";
import EventEditor from "~/components/EventEditor.vue";
import EventMenu from "~/components/EventMenu.vue";
import PageHeader from "~/components/PageHeader.vue";
import SaveBar from "~/components/SaveBar.vue";
import Index from "~/pages/events/index.vue";
import Event from "~/pages/events/[id].vue";
import Details from "~/pages/events/[id]/details.vue";
import { DINNER, WORSHIP } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const ID = "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f";

/** A view whoever is signed in has saved: the recurring events, a week at a time. */
const WEEKLY: ViewRecord = {
  id: ID,
  surface: "events",
  name: "Weekly",
  payload: {
    view: "week",
    clauses: [{ kind: "filter", key: "recurring", op: "is", value: "true" }],
    interval: 0,
  },
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/* A Thursday of October 2026, mid-morning in the church's own time. */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-15T17:00:00Z") });
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * The events page over the admin's API answering with the events given,
 * and holding the views given as whoever is signed in has saved them.
 */
const mountEvents = async (items: EventRecord[], saved: ViewRecord[] = []) => {
  const fetch = vi.fn(async (path: string, _request?: object) =>
    path.startsWith("/api/views/") ? saved : items,
  );
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

type Mounted = Awaited<ReturnType<typeof mountEvents>>["wrapper"];

/** The page's own dialog, the new event's: the views have theirs too. */
const adding = (wrapper: Mounted) =>
  wrapper
    .findAllComponents(Dialog)
    .find((dialog) => dialog.props("title") === "New event")!;

/**
 * What a day holds: the address each time an event is held leads to, when
 * it starts and what it is called.
 */
const held = (wrapper: Mounted, date: string) =>
  wrapper
    .findAll(`.f-data-calendar-day[data-date="${date}"] a`)
    .map((link) => [
      link.attributes("href"),
      link.find("time").text(),
      link.find(".f-span").text(),
    ]);

describe("events page", () => {
  it("heads the events calendar with the way to a new event, the days it shows fetched on load, after its views", async () => {
    const { wrapper, fetch } = await mountEvents([WORSHIP, DINNER]);
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Events",
      description: "Weekly gatherings and one-time events.",
      action: "New event",
    });
    expect(wrapper.find("a.page-header-action").exists()).toBe(false);
    const calendar = wrapper.findComponent(Calendar);
    expect(calendar.props("service").id).toBe("events");
    // The views load first, so the calendar's one fetch reads the open one.
    expect(fetch.mock.calls).toEqual([
      ["/api/views/events", {}],
      ["/api/events/held", { query: { from: "2026-09-27", to: "2026-10-31" } }],
    ]);
    expect(calendar.props("service").initialized).toBe(true);
    expect(head()).toEqual({ title: "Events" });
  });

  it("lays the month out in weeks from Sunday, today marked, under what the month is", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    expect(wrapper.find(".f-data-calendar").attributes("data-view")).toBe(
      "month",
    );
    expect(wrapper.find(".f-data-calendar-heading").text()).toBe(
      "October 2026",
    );
    expect(
      wrapper.findAll(".f-data-calendar-weekday").map((day) => day.text()),
    ).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(wrapper.findAll(".f-data-calendar-week")).toHaveLength(5);
    expect(
      wrapper
        .findAll(".f-data-calendar-day[data-today]")
        .map((day) => day.attributes("data-date")),
    ).toEqual(["2026-10-15"]);
  });

  it("offers today, a step each way, and a month, a week or the agenda, and no single day", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    expect(
      wrapper
        .findAll(".f-data-calendar-tool")
        .map((tool) => tool.attributes("data-tool")),
    ).toEqual(["today", "prev", "next", "month", "week", "agenda"]);
    expect(
      wrapper
        .find('.f-data-calendar-tool[data-tool="month"]')
        .attributes("aria-pressed"),
    ).toBe("true");
  });

  it("makes each time an event is held the way to the event's details", async () => {
    const { wrapper } = await mountEvents([WORSHIP, DINNER]);
    // The first and third Sundays of the month, and the one Saturday.
    expect(held(wrapper, "2026-10-04")).toEqual([
      ["/events/3/details", "10:00 AM", "Worship Service"],
    ]);
    expect(held(wrapper, "2026-10-11")).toEqual([]);
    expect(held(wrapper, "2026-10-18")).toEqual([
      ["/events/3/details", "10:00 AM", "Worship Service"],
    ]);
    expect(held(wrapper, "2026-10-24")).toEqual([
      ["/events/4/details", "5:30 PM", "Harvest Dinner"],
    ]);
    expect(wrapper.findAll(".f-data-calendar-occurrence")).toHaveLength(3);
    expect(wrapper.find("button.f-data-calendar-occurrence").exists()).toBe(
      false,
    );
  });

  it("steps to the next month, and asks for the days it then shows", async () => {
    const { wrapper, fetch } = await mountEvents([WORSHIP, DINNER]);
    await wrapper
      .find('.f-data-calendar-tool[data-tool="next"]')
      .trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/events/held", {
      query: { from: "2026-11-01", to: "2026-12-05" },
    });
    expect(wrapper.find(".f-data-calendar-heading").text()).toBe(
      "November 2026",
    );
    expect(held(wrapper, "2026-11-15")).toEqual([
      ["/events/3/details", "10:00 AM", "Worship Service"],
    ]);
  });

  it("lists the days to come as an agenda, and says when they hold nothing", async () => {
    const { wrapper } = await mountEvents([DINNER]);
    const agenda = wrapper.find('.f-data-calendar-tool[data-tool="agenda"]');
    await agenda.trigger("click");
    await flushPromises();
    expect(wrapper.find(".f-data-calendar-grid").exists()).toBe(false);
    expect(held(wrapper, "2026-10-24")).toEqual([
      ["/events/4/details", "5:30 PM", "Harvest Dinner"],
    ]);
    expect(wrapper.find(".f-data-calendar-empty").exists()).toBe(false);

    const empty = await mountEvents([]);
    expect(empty.wrapper.find(".f-data-calendar-agenda").exists()).toBe(true);
    expect(empty.wrapper.find(".f-data-calendar-empty").exists()).toBe(true);
    expect(empty.wrapper.find(".f-data-calendar-occurrence").exists()).toBe(
      false,
    );
  });

  it("searches: the calendar carries a search box", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    expect(
      wrapper.find(".f-data-calendar-search .f-autocomplete-input").exists(),
    ).toBe(true);
  });
});

describe("events views", () => {
  const services = (wrapper: Mounted) => ({
    views: wrapper.findComponent(Views).props("service"),
    calendar: wrapper.findComponent(Calendar).props("service"),
  });

  it("opens on the admin's own view, the calendar as it starts, with nothing edited", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    const { views, calendar } = services(wrapper);
    expect(views.id).toBe("events");
    expect(views.initialized).toBe(true);
    expect(views.views).toMatchObject([
      { id: "all", name: "admin.events.allView", origin: "system" },
    ]);
    expect(views.active).toBe("all");
    expect(views.current.payload).toEqual(calendar.snapshot());
    expect(views.drifted).toBe(false);
    expect(wrapper.findAll(".f-views-tabs .f-tabs-trigger")).toHaveLength(1);
  });

  it("lists the views whoever is signed in has saved after it, and puts one picked in place on the day the calendar stands on", async () => {
    const { wrapper, fetch } = await mountEvents([WORSHIP], [WEEKLY]);
    const { views, calendar } = services(wrapper);
    expect(views.views).toMatchObject([
      { id: "all", origin: "system" },
      { id: ID, name: "Weekly", origin: "user" },
    ]);
    expect(views.stale).toEqual([]);
    expect(wrapper.find(".f-views-tabs").text()).toContain("Weekly");

    expect(await views.select(ID)).toBe(true);
    await flushPromises();
    expect(views.active).toBe(ID);
    expect(calendar.view).toBe("week");
    expect(calendar.date).toBe("2026-10-15");
    expect(calendar.snapshot()).toEqual(WEEKLY.payload);
    expect(fetch).toHaveBeenLastCalledWith("/api/events/held", {
      query: { from: "2026-10-11", to: "2026-10-17", recurringIs: "true" },
    });
    expect(views.drifted).toBe(false);
  });

  it("marks the open view as edited once the calendar shows another view or is searched, and not when it steps through time", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    const { views, calendar } = services(wrapper);
    calendar.next();
    await flushPromises();
    expect(views.drifted).toBe(false);
    calendar.show("agenda");
    await flushPromises();
    expect(views.drifted).toBe(true);
    expect(wrapper.find(".f-views").classes()).toContain("f-views-drifted");
  });

  it("saves a view under the events' own name, as the API takes it", async () => {
    const { wrapper, fetch } = await mountEvents([WORSHIP]);
    const { views, calendar } = services(wrapper);
    calendar.show("week");
    await flushPromises();
    const view = await views.saveAs("This week");
    const [path, request] = fetch.mock.calls.at(-1)!;
    expect(path).toBe(`/api/views/events/${view.id}`);
    expect(request).toEqual({
      method: "PUT",
      body: {
        name: "This week",
        payload: { view: "week", clauses: [], interval: 0 },
      },
    });
    expect(
      eventViewBody.safeParse((request as { body: unknown }).body).success,
    ).toBe(true);
  });

  it("sets aside a saved view the events' schema would refuse", async () => {
    const stale = { ...WEEKLY, payload: { view: "day", clauses: [] } };
    const { wrapper } = await mountEvents([WORSHIP], [stale]);
    const { views } = services(wrapper);
    expect(views.views.map((view: { id: string }) => view.id)).toEqual(["all"]);
    expect(views.stale).toHaveLength(1);
  });
});

describe("new event dialog", () => {
  const open = async () => {
    const mounted = await mountEvents([WORSHIP]);
    await mounted.wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    return mounted;
  };

  it("stays shut until a new event is asked for", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    expect(adding(wrapper).props("open")).toBe(false);
    expect(wrapper.findComponent(EventEditor).exists()).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("opens the editor on no record, over the list, named and described", async () => {
    const { wrapper } = await open();
    const dialog = adding(wrapper);
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "New event",
      description: "You can add a picture and description after saving.",
    });
    const content = document.body.querySelector(".f-dialog-content")!;
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.querySelector(".f-dialog-title")?.textContent?.trim()).toBe(
      "New event",
    );
    expect(dialog.findComponent(EventEditor).props("record")).toBeNull();
    expect(wrapper.findComponent(Calendar).exists()).toBe(true);
    expect(head()).toEqual({ title: "Events" });
  });

  it("shuts from its corner, and opens blank the next time", async () => {
    const { wrapper } = await open();
    const editor = adding(wrapper).findComponent(EventEditor);
    await editor.find("#event-title").setValue("Harvest Dinner");
    // The dialog is drawn on the body, outside the page's own element.
    const close = document.body.querySelector<HTMLButtonElement>(
      ".f-dialog-content .events-new-close",
    )!;
    expect(close.getAttribute("aria-label")).toBe("Cancel");
    close.click();
    await flushPromises();
    expect(adding(wrapper).props("open")).toBe(false);
    expect(wrapper.findComponent(EventEditor).exists()).toBe(false);
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    const title = wrapper.findComponent(EventEditor).find("#event-title");
    expect((title.element as HTMLInputElement).value).toBe("");
  });

  it("writes the event and leads on to its page", async () => {
    const { wrapper } = await open();
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    const editor = adding(wrapper).findComponent(EventEditor);
    await editor.find("#event-title").setValue("Harvest Dinner");
    await editor.find("#event-slug").setValue("harvest-dinner");
    await editor.find("#event-date").setValue("2026-10-24");
    await editor.find("#event-start").setValue("17:30");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/events/4/details"),
    );
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      body: {
        slug: "harvest-dinner",
        title: "Harvest Dinner",
        date: "2026-10-24",
        recurring: false,
        start: "17:30",
      },
    });
  });
});

describe("event page", () => {
  const mountEvent = async (path = "/events/3/details") => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => WORSHIP),
    );
    setRoutePath(path, { id: "3" });
    return mountSuspended(Event);
  };

  it("heads the event the address names, and hands it to the page under it", async () => {
    const { wrapper, error } = await mountEvent();
    expect(error).toBeUndefined();
    const header = wrapper.findComponent(PageHeader);
    expect(header.props()).toMatchObject({
      title: "Worship Service",
      description: "We gather on Sunday morning.",
      back: { label: "Events", to: "/events", icon: "chevron-left" },
    });
    expect(header.find("a.page-header-back").attributes("href")).toBe(
      "/events",
    );
    expect(header.findComponent(EventMenu).props("record")).toEqual(WORSHIP);
    expect(wrapper.findComponent(NuxtPage).props("record")).toEqual(WORSHIP);
    expect(head()).toEqual({ title: "Worship Service" });
  });

  it("offers the event's pages as tabs, its details the first and only one, lit when read", async () => {
    const { wrapper } = await mountEvent();
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Details", to: "/events/3/details" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(tabs.map((tab) => [tab.element.tagName, tab.text()])).toEqual([
      ["A", "Details"],
    ]);
    expect(tabs[0]?.attributes("href")).toBe("/events/3/details");
    expect(tabs[0]?.attributes("data-state")).toBe("active");
  });

  it("names the event afresh once the page under it saves it", async () => {
    const { wrapper } = await mountEvent();
    wrapper.findComponent(NuxtPage).vm.$emit("saved", {
      ...WORSHIP,
      title: "Sunday Worship",
      summary: "Every Sunday.",
    });
    await flushPromises();
    expect(wrapper.find(".page-header-title").text()).toBe("Sunday Worship");
    expect(wrapper.find(".page-header-description").text()).toBe(
      "Every Sunday.",
    );
    expect(head()).toEqual({ title: "Sunday Worship" });
  });

  it("describes the event by its summary, or not at all", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => DINNER),
    );
    setRoutePath("/events/4/details", { id: "4" });
    const { wrapper } = await mountSuspended(Event);
    expect(wrapper.find(".page-header-title").text()).toBe("Harvest Dinner");
    expect(wrapper.find(".page-header-description").exists()).toBe(false);
  });

  it("throws a 404 when no event has the id", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    setRoutePath("/events/9/details", { id: "9" });
    const { wrapper, error } = await mountSuspended(Event);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Event not found",
    });
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("throws a 404 for an address that names no number", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath("/events/x/details", { id: "x" });
    const { error } = await mountSuspended(Event);
    expect(error).toMatchObject({ statusCode: 404 });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("details page", () => {
  it("lays the event out in two panels: its details, its picture among them, then what is written about it", () => {
    const wrapper = mount(Details, { props: { record: WORSHIP } });
    const panels = wrapper.find(".event-page").element.children;
    expect([...panels].map((panel) => panel.className)).toEqual([
      "event-page-side",
      "event-body",
      "save-bar",
    ]);
    const side = wrapper.find(".event-page-side");
    expect([...side.element.children].map((child) => child.className)).toEqual([
      "event-editor",
    ]);
    expect(side.find(".event-editor .image-field").exists()).toBe(true);
    expect(side.findComponent(EventEditor).props("record")).toEqual(WORSHIP);
    expect(side.findComponent(EventBody).exists()).toBe(false);
    expect(wrapper.findComponent(EventBody).props("record")).toEqual(WORSHIP);
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("lists the headings of what is written about the event under its details, each linked to its own", async () => {
    const body = {
      type: "root" as const,
      children: [
        {
          type: "element" as const,
          tagName: "h2",
          properties: {},
          children: [{ type: "text" as const, value: "Our Vision" }],
        },
      ],
    };
    const wrapper = mount(Details, {
      props: { record: { ...WORSHIP, body } },
    });
    await wrapper.vm.$nextTick();
    const link = wrapper.find(
      ".event-page-side > .event-editor + nav.toc a.toc-link",
    );
    expect(link.text()).toBe("Our Vision");
    expect(link.attributes("href")).toBe("#our-vision");
    expect(wrapper.find(".event-body h2#our-vision").exists()).toBe(true);
  });

  it("lists nothing under the details of an event with no headings", async () => {
    const wrapper = mount(Details, { props: { record: WORSHIP } });
    await wrapper.vm.$nextTick();
    expect(wrapper.find("nav.toc").exists()).toBe(false);
  });

  it("passes the record the form saved up to the page around it", () => {
    const wrapper = mount(Details, { props: { record: DINNER } });
    const changed = { ...DINNER, title: "Harvest Supper" };
    wrapper.findComponent(EventEditor).vm.$emit("saved", changed);
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
  });

  /** The page, drawn on the screen, with its bar's two buttons. */
  const mountWhole = () => {
    const wrapper = mount(Details, {
      props: { record: WORSHIP },
      attachTo: document.body,
    });
    return {
      wrapper,
      save: wrapper.find("button.save-bar-save"),
      reset: wrapper.find("button.save-bar-reset"),
      content: () => wrapper.find(".event-body .f-data-editor-content"),
    };
  };

  /** Writes over the whole of what is written, as typing over a selection does. */
  const write = async (page: ReturnType<typeof mountWhole>, text: string) => {
    await page.content().trigger("pointerdown");
    await page.wrapper.vm.$nextTick();
    page.wrapper
      .findComponent(EventBody)
      .findComponent(Editor)
      .props("service")
      .run(
        (chain: {
          selectAll: () => { insertContent: (text: string) => unknown };
        }) => chain.selectAll().insertContent(text),
      );
    await page.wrapper.vm.$nextTick();
  };

  it("ends in one bar that saves the whole record, with nothing to do until something changes, and no button in either panel", () => {
    const { wrapper, save, reset } = mountWhole();
    expect(wrapper.findAll("button.save-bar-save")).toHaveLength(1);
    expect(wrapper.findComponent(SaveBar).props()).toEqual({
      dirty: false,
      open: false,
      saving: false,
      errors: [],
    });
    expect(save.attributes("disabled")).toBeDefined();
    expect(reset.attributes("disabled")).toBeDefined();
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
    expect(
      wrapper.findAll("button").filter((b) => b.text() === "Save"),
    ).toHaveLength(1);
  });

  it("saves the details and what is written at once, each where it is kept", async () => {
    const changed = { ...WORSHIP, title: "Morning Worship" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    await page.wrapper.find("#event-title").setValue("Morning Worship");
    await write(page, "Since 2010.");
    expect(page.save.attributes("disabled")).toBeUndefined();
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith("/api/events/3", {
      method: "PUT",
      body: expect.objectContaining({ title: "Morning Worship" }),
    });
    expect(fetch).toHaveBeenCalledWith("/api/events/3/body", {
      method: "PATCH",
      body: { body: expect.objectContaining({ type: "root" }) },
    });
    expect(page.wrapper.emitted("saved")).toEqual([[changed]]);
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("saves only the panel that changed", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    await write(page, "Since 2010.");
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/events/3/body", expect.anything());
  });

  it("resets the details and what is written at once, to what was last saved", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    const field = page.wrapper.find("#event-title");
    await field.setValue("Morning Worship");
    await write(page, "A slip of the keys.");
    expect(page.reset.attributes("disabled")).toBeUndefined();
    await page.reset.trigger("click");
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect((field.element as HTMLInputElement).value).toBe("Worship Service");
    expect(page.content().text()).toBe("Has served since 2010.");
    expect(page.content().attributes("contenteditable")).toBeUndefined();
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("says in the bar what went wrong with a save, and keeps what was written to try again", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const page = mountWhole();
    await page.wrapper.find("#event-title").setValue("Morning Worship");
    await page.save.trigger("click");
    await flushPromises();
    const errors = page.wrapper.findAll(".save-bar-error");
    expect(errors.map((error) => error.text())).toEqual([
      "The server is away.",
    ]);
    expect(page.save.attributes("disabled")).toBeUndefined();
  });
});
