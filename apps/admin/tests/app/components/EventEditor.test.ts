import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { DINNER, WORSHIP } from "#test/support/records";
import EventEditor from "~/components/EventEditor.vue";

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

describe("EventEditor", () => {
  it("opens blank for a new event, held once on no date yet", () => {
    const wrapper = mount(EventEditor, { props: { record: null } });
    expect(value(wrapper, "event-title")).toBe("");
    expect(value(wrapper, "event-status")).toBe("draft");
    expect(wrapper.find("#event-date").exists()).toBe(true);
    expect(wrapper.find("#event-day").exists()).toBe(false);
    expect(wrapper.find(".record-form-delete").exists()).toBe(false);
  });

  it("opens on a weekly event with its day and weeks, and no date", () => {
    const wrapper = mount(EventEditor, { props: { record: WORSHIP } });
    expect(value(wrapper, "event-title")).toBe("Worship Service");
    expect(value(wrapper, "event-day")).toBe("sunday");
    expect(value(wrapper, "event-weeks")).toBe("1, 3");
    expect(value(wrapper, "event-start")).toBe("10:00");
    expect(value(wrapper, "event-end")).toBe("11:30");
    expect(wrapper.find("#event-date").exists()).toBe(false);
    expect(wrapper.find(".record-form-delete").exists()).toBe(true);
  });

  it("opens on a one-off with its date, and no day", () => {
    const wrapper = mount(EventEditor, { props: { record: DINNER } });
    expect(value(wrapper, "event-date")).toBe("2026-10-24");
    expect(value(wrapper, "event-location")).toBe("Fellowship Hall");
    expect(value(wrapper, "event-note")).toBe("Bring a dish.");
    expect(wrapper.find("#event-day").exists()).toBe(false);
  });

  it("swaps the date for the day and weeks as the kind is chosen", async () => {
    const wrapper = mount(EventEditor, { props: { record: DINNER } });
    await wrapper.find('input[type="radio"][value="weekly"]').setValue();
    expect(wrapper.find("#event-date").exists()).toBe(false);
    expect(wrapper.find("#event-day").exists()).toBe(true);
    expect(wrapper.find("#event-weeks").exists()).toBe(true);
    await wrapper.find('input[type="radio"][value="once"]').setValue();
    expect(wrapper.find("#event-date").exists()).toBe(true);
    expect(wrapper.find("#event-day").exists()).toBe(false);
  });

  it("labels every control", () => {
    const wrapper = mount(EventEditor, { props: { record: WORSHIP } });
    for (const label of wrapper.findAll("label[for]")) {
      expect(wrapper.find(`#${label.attributes("for")}`).exists()).toBe(true);
    }
    expect(wrapper.find("fieldset legend").text()).toBe("Held");
  });

  it("writes a weekly event from what is typed", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(EventEditor, { props: { record: null } });
    await wrapper.find("#event-title").setValue("Prayer Meeting");
    await wrapper.find("#event-slug").setValue("prayer-meeting");
    await wrapper.find('input[type="radio"][value="weekly"]').setValue();
    await wrapper.find("#event-day").setValue("thursday");
    await wrapper.find("#event-weeks").setValue("2, 4");
    await wrapper.find("#event-start").setValue("19:00");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      body: {
        slug: "prayer-meeting",
        title: "Prayer Meeting",
        day: "thursday",
        weeks: [2, 4],
        start: "19:00",
        status: "draft",
      },
    });
  });

  it("shows what is wrong with a draft, and stays open", async () => {
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(EventEditor, { props: { record: DINNER } });
    await wrapper.find("#event-end").setValue("09:00");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find(".record-form-error").exists()).toBe(true),
    );
    expect(wrapper.find(".record-form-error").text()).toContain("end:");
    expect(fetch).not.toHaveBeenCalled();
  });
});
