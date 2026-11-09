import type { EventRecord } from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Dialog, NuxtPage, Table } from "#components";
import { setRoutePath, useRouter } from "#imports";
import EventBody from "~/components/EventBody.vue";
import EventEditor from "~/components/EventEditor.vue";
import EventImage from "~/components/EventImage.vue";
import EventMenu from "~/components/EventMenu.vue";
import PageHeader from "~/components/PageHeader.vue";
import Index from "~/pages/events/index.vue";
import Event from "~/pages/events/[id].vue";
import Details from "~/pages/events/[id]/details.vue";
import { DINNER, WORSHIP } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

/** The events page over the admin's API listing the events given. */
const mountEvents = async (items: EventRecord[]) => {
  const fetch = vi.fn(async () => ({ items, total: items.length }));
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

describe("events page", () => {
  it("heads the events table with the way to a new event, its first page fetched on load", async () => {
    const { wrapper, fetch } = await mountEvents([WORSHIP, DINNER]);
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Events",
      description:
        "What the church holds: the weekly gatherings and the one-off events on its calendar.",
      action: "New event",
    });
    expect(wrapper.find("a.page-header-action").exists()).toBe(false);
    const table = wrapper.findComponent(Table);
    expect(table.props("service").id).toBe("events");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      query: { page: 1, size: 25 },
    });
    expect(table.props("service").data).toEqual([WORSHIP, DINNER]);
    expect(head()).toEqual({ title: "Events" });
  });

  it("lists the events under the columns shown at first, the row's actions after them", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    expect(wrapper.find(".f-data-table table").exists()).toBe(true);
    expect(
      wrapper
        .findAll(".f-th:not(.f-data-table-actions)")
        .map((th) => th.text()),
    ).toEqual(["Title", "Day", "Date", "Repeats weekly", "Start", "Updated"]);
    expect(wrapper.find(".f-th.f-data-table-actions").exists()).toBe(true);
  });

  it("sorts by a heading when it is clicked, and marks the sorted one", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    const heading = wrapper
      .findAll(".f-th")
      .find((th) => th.text() === "Start")!;
    expect(heading.classes()).toContain("f-data-table-sortable");
    expect(heading.classes()).not.toContain("f-data-table-sorted");
    await heading.find("button").trigger("click");
    await flushPromises();
    expect(heading.classes()).toContain("f-data-table-sorted");
  });

  it("searches: the table carries a search box", async () => {
    const { wrapper } = await mountEvents([WORSHIP]);
    expect(
      wrapper.find(".f-data-table-search .f-autocomplete-input").exists(),
    ).toBe(true);
  });

  it("makes the title of each row the way to the event's details", async () => {
    const { wrapper } = await mountEvents([WORSHIP, DINNER]);
    const links = wrapper.findAll(".f-td > a.f-anchor");
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/events/3/details",
      "/events/4/details",
    ]);
    expect(links.map((link) => link.text())).toEqual([
      "Worship Service",
      "Harvest Dinner",
    ]);
  });

  it("says when there is nothing to list", async () => {
    const { wrapper } = await mountEvents([]);
    expect(wrapper.find(".f-data-table-empty").exists()).toBe(true);
    expect(wrapper.find(".f-td > a.f-anchor").exists()).toBe(false);
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
    expect(wrapper.findComponent(Dialog).props("open")).toBe(false);
    expect(wrapper.findComponent(EventEditor).exists()).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("opens the editor on no record, over the list, named and described", async () => {
    const { wrapper } = await open();
    const dialog = wrapper.findComponent(Dialog);
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "New event",
      description:
        "Its details come first. Its picture and what is written about it are added on its page, once it is saved.",
    });
    const content = document.body.querySelector(".f-dialog-content")!;
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.querySelector(".f-dialog-title")?.textContent?.trim()).toBe(
      "New event",
    );
    expect(dialog.findComponent(EventEditor).props("record")).toBeNull();
    expect(wrapper.findComponent(Table).exists()).toBe(true);
    expect(head()).toEqual({ title: "Events" });
  });

  it("shuts from its corner, and opens blank the next time", async () => {
    const { wrapper } = await open();
    const editor = wrapper.findComponent(Dialog).findComponent(EventEditor);
    await editor.find("#event-title").setValue("Harvest Dinner");
    // The dialog is drawn on the body, outside the page's own element.
    const close = document.body.querySelector<HTMLButtonElement>(
      ".f-dialog-content .events-new-close",
    )!;
    expect(close.getAttribute("aria-label")).toBe("Cancel");
    close.click();
    await flushPromises();
    expect(wrapper.findComponent(Dialog).props("open")).toBe(false);
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
    const editor = wrapper.findComponent(Dialog).findComponent(EventEditor);
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
  it("lays the event out in two panels: its picture over its details, then what is written about it", () => {
    const wrapper = mount(Details, { props: { record: WORSHIP } });
    const panels = wrapper.find(".event-page").element.children;
    expect([...panels].map((panel) => panel.className)).toEqual([
      "event-page-side",
      "event-body",
    ]);
    const side = wrapper.find(".event-page-side");
    expect([...side.element.children].map((child) => child.className)).toEqual([
      "event-image",
      "event-editor",
    ]);
    expect(side.findComponent(EventImage).props("record")).toEqual(WORSHIP);
    expect(side.findComponent(EventEditor).props("record")).toEqual(WORSHIP);
    expect(side.findComponent(EventBody).exists()).toBe(false);
    expect(wrapper.findComponent(EventBody).props("record")).toEqual(WORSHIP);
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("passes the record the form saved up to the page around it", () => {
    const wrapper = mount(Details, { props: { record: DINNER } });
    const changed = { ...DINNER, title: "Harvest Supper" };
    wrapper.findComponent(EventEditor).vm.$emit("saved", changed);
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
  });
});
