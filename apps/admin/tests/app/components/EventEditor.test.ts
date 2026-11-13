import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { useRouter } from "#imports";
import { mountHeld } from "#test/support/drafts";
import { DINNER, WORSHIP } from "#test/support/records";
import Checkbox from "@zoobzio/vue/components/checkbox.vue";
import MultiSelect from "@zoobzio/vue/components/multi-select.vue";
import EventEditor from "~/components/EventEditor.vue";

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

describe("EventEditor", () => {
  it("opens blank for a new event, held once, on every week", () => {
    const wrapper = mount(EventEditor, { props: { record: null } });
    expect(value(wrapper, "event-title")).toBe("");
    expect(value(wrapper, "event-slug")).toBe("");
    expect(value(wrapper, "event-date")).toBe("");
    expect(wrapper.findComponent(Checkbox).props("modelValue")).toBe(false);
    expect(wrapper.find("#event-weeks").text()).toBe("Every week");
  });

  it("opens on an event's record, every field filled, with a save alone: the page's menu deletes", () => {
    const wrapper = mount(EventEditor, { props: { record: WORSHIP } });
    expect(value(wrapper, "event-title")).toBe("Worship Service");
    expect(value(wrapper, "event-slug")).toBe("worship-service");
    expect(value(wrapper, "event-date")).toBe("2026-01-04");
    expect(value(wrapper, "event-start")).toBe("10:00");
    expect(value(wrapper, "event-end")).toBe("11:30");
    expect(wrapper.findComponent(Checkbox).props("modelValue")).toBe(true);
    expect(wrapper.findComponent(MultiSelect).props("modelValue")).toEqual([
      { value: "1", label: "First" },
      { value: "3", label: "Third" },
    ]);
    expect(value(wrapper, "event-summary")).toBe(
      "We gather on Sunday morning.",
    );
    expect(
      wrapper.findAll('button[type="submit"]').map((b) => b.text()),
    ).toEqual(["Save"]);
    expect(wrapper.text()).not.toContain("Delete");
  });

  it("is one column of an event's details: a date, its times and whether it repeats, and no picture, body, status, note or location", () => {
    const wrapper = mount(EventEditor, { props: { record: DINNER } });
    expect(
      wrapper.findAll(".f-data-form-field label").map((label) => label.text()),
    ).toEqual([
      "Title",
      "Slug",
      "Date",
      "Start",
      "End",
      "Repeats weekly",
      "Weeks",
      "Summary",
    ]);
    const type = (id: string) => wrapper.find(`#${id}`).attributes("type");
    expect(type("event-date")).toBe("date");
    expect(type("event-start")).toBe("time");
    expect(type("event-end")).toBe("time");
    expect(wrapper.find("textarea#event-summary").exists()).toBe(true);
    for (const key of ["body", "image", "status", "note", "location", "day"]) {
      expect(wrapper.find(`#event-${key}`).exists(), key).toBe(false);
    }
    expect(wrapper.find(".f-data-editor").exists()).toBe(false);
  });

  it("says under a field what it is for, and ties the hint to it", () => {
    const wrapper = mount(EventEditor, { props: { record: null } });
    const hint = (id: string) => wrapper.find(`#${id}-hint`).text();
    expect(hint("event-slug")).toBe("Lowercase words joined by hyphens.");
    expect(hint("event-date")).toBe(
      "A recurring event is held every week on this date’s day of the week.",
    );
    expect(hint("event-weeks")).toBe(
      "For a recurring event: which of the month’s weeks. None picked is every week.",
    );
    expect(wrapper.find("#event-date").attributes("aria-describedby")).toBe(
      "event-date-hint",
    );
  });

  it("labels every control", () => {
    const wrapper = mount(EventEditor, { props: { record: null } });
    const labels = wrapper.findAll("label");
    expect(labels.length).toBe(8);
    for (const label of labels) {
      const id = label.attributes("for");
      expect(id).toBeDefined();
      expect(wrapper.find(`#${id}`).exists(), id).toBe(true);
    }
  });

  it("saves without the browser's own checks, and leaves the form's title to the page", () => {
    const wrapper = mount(EventEditor, { props: { record: WORSHIP } });
    expect(wrapper.find("form").attributes("novalidate")).toBeDefined();
    expect(wrapper.find(".f-data-form-title").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Worship Service");
  });

  it("clears the weeks as the event is unticked from repeating", async () => {
    const wrapper = mount(EventEditor, { props: { record: WORSHIP } });
    wrapper.findComponent(Checkbox).vm.$emit("update:modelValue", false);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(Checkbox).props("modelValue")).toBe(false);
    expect(wrapper.find("#event-weeks").text()).toBe("Every week");
  });

  it("writes what is typed as a new event, repeating once it is ticked", async () => {
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(EventEditor, { props: { record: null } });
    await wrapper.find("#event-title").setValue("Harvest Dinner");
    await wrapper.find("#event-slug").setValue("harvest-dinner");
    await wrapper.find("#event-date").setValue("2026-10-24");
    await wrapper.find("#event-start").setValue("17:30");
    wrapper.findComponent(Checkbox).vm.$emit("update:modelValue", true);
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      body: {
        slug: "harvest-dinner",
        title: "Harvest Dinner",
        date: "2026-10-24",
        recurring: true,
        start: "17:30",
      },
    });
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/events/4/details"),
    );
  });

  it("saves an event's details in place, and says which was saved", async () => {
    const changed = { ...DINNER, title: "Harvest Supper" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(EventEditor, { props: { record: DINNER } });
    await wrapper.find("#event-title").setValue("Harvest Supper");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(wrapper.emitted("saved")).toBeTruthy());
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
    expect(fetch).toHaveBeenCalledWith("/api/events/4", {
      method: "PUT",
      body: expect.objectContaining({
        title: "Harvest Supper",
        date: "2026-10-24",
        recurring: false,
      }),
    });
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(value(wrapper, "event-title")).toBe("Harvest Supper");
  });

  it("shows what is wrong with a draft, by its field, and stays open", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(EventEditor, { props: { record: WORSHIP } });
    await wrapper.find("#event-end").setValue("09:00");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find("#event-end-error").exists()).toBe(true),
    );
    expect(wrapper.find("#event-end-error").text()).toBe(
      "an event ends after it starts",
    );
    expect(wrapper.find("#event-end").attributes("aria-invalid")).toBe("true");
    expect(wrapper.find(".event-editor-error").exists()).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says what went wrong when the save fails, where a reader is told", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const wrapper = mount(EventEditor, { props: { record: WORSHIP } });
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find(".event-editor-error").exists()).toBe(true),
    );
    const error = wrapper.find(".event-editor-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("The server is away.");
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(wrapper.find(".event-editor-save").text()).toBe("Save");
  });

  it("leaves the save to the page that holds its record: no button of its own, the form handed in", async () => {
    const changed = { ...WORSHIP, title: "Morning Worship" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, drafts } = mountHeld(EventEditor, WORSHIP);
    expect(wrapper.find("button.event-editor-save").exists()).toBe(false);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
    expect(drafts.dirty.value).toBe(false);
    expect(drafts.open.value).toBe(false);
    await wrapper.find("#event-title").setValue("Morning Worship");
    expect(drafts.dirty.value).toBe(true);
    expect(drafts.open.value).toBe(true);
    await drafts.save();
    expect(fetch).toHaveBeenCalledWith("/api/events/3", {
      method: "PUT",
      body: expect.objectContaining({ title: "Morning Worship" }),
    });
    expect(drafts.dirty.value).toBe(false);
    expect(wrapper.findComponent(EventEditor).emitted("saved")).toEqual([
      [changed],
    ]);
    expect(value(wrapper, "event-title")).toBe("Morning Worship");
  });

  it("is put back as it was last saved when the page resets its record", async () => {
    const { wrapper, drafts } = mountHeld(EventEditor, WORSHIP);
    await wrapper.find("#event-title").setValue("Morning Worship");
    drafts.reset();
    await wrapper.vm.$nextTick();
    expect(value(wrapper, "event-title")).toBe("Worship Service");
    expect(drafts.dirty.value).toBe(false);
  });

  it("hands what went wrong with a save to the page's bar", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const { wrapper, drafts } = mountHeld(EventEditor, WORSHIP);
    await wrapper.find("#event-title").setValue("Morning Worship");
    await drafts.save();
    await wrapper.vm.$nextTick();
    expect(drafts.errors.value).toEqual(["The server is away."]);
    expect(drafts.dirty.value).toBe(true);
    expect(wrapper.find(".event-editor-error").exists()).toBe(false);
  });

  it("keeps its own save for a new event, whatever page it is drawn on", () => {
    const { wrapper, drafts } = mountHeld(EventEditor, null);
    expect(wrapper.find("button.event-editor-save").text()).toBe("Save");
    expect(drafts.open.value).toBe(false);
  });
});
