import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { setRoutePath, useHead } from "#imports";
import EventEditor from "~/components/EventEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import Index from "~/pages/events/index.vue";
import New from "~/pages/events/new.vue";
import Editor from "~/pages/events/[id].vue";
import { DINNER } from "#test/support/records";
import { mountSuspended } from "#test/support/mount";

describe("events page", () => {
  it("heads the events table with the way to a new event", () => {
    const wrapper = mount(Index, { global: { stubs: { RecordTable: true } } });
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Events",
      to: "/events/new",
      action: "New event",
    });
    const table = wrapper.findComponent(RecordTable);
    expect(table.props("title")).toBe("title");
    expect(table.props("widget").service.id).toBe("events");
    expect(table.props("link")(DINNER)).toBe("/events/4");
    expect(useHead).toHaveBeenCalledWith({ title: "Events" });
  });
});

describe("new event page", () => {
  it("opens the editor on no record", () => {
    const wrapper = mount(New, { global: { stubs: { EventEditor: true } } });
    expect(wrapper.findComponent(PageHeader).props("title")).toBe("New event");
    expect(wrapper.findComponent(EventEditor).props("record")).toBeNull();
  });
});

describe("event page", () => {
  it("opens the editor on the event the address names", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => DINNER),
    );
    setRoutePath("/events/4", { id: "4" });
    const { wrapper, error } = await mountSuspended(Editor);
    expect(error).toBeUndefined();
    expect(wrapper.findComponent(PageHeader).props("title")).toBe(
      "Harvest Dinner",
    );
    expect(wrapper.findComponent(EventEditor).props("record")).toEqual(DINNER);
  });

  it("throws a 404 when no event has the id", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => null),
    );
    setRoutePath("/events/x", { id: "x" });
    const { error } = await mountSuspended(Editor);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Event not found",
    });
  });
});
