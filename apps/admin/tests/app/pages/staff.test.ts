import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { setRoutePath, useHead } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import StaffEditor from "~/components/StaffEditor.vue";
import Index from "~/pages/staff/index.vue";
import New from "~/pages/staff/new.vue";
import Editor from "~/pages/staff/[id].vue";
import { STAFF } from "#test/support/records";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

describe("staff page", () => {
  it("heads the staff table with the way to a new member, its first page fetched on load", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 1 }));
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await mountSuspended(Index);
    expect(error).toBeUndefined();
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Staff",
      to: "/staff/new",
      action: "New member",
    });
    const table = wrapper.findComponent(RecordTable);
    expect(table.props("title")).toBe("name");
    expect(table.props("table").id).toBe("staff");
    expect(table.props("link")(STAFF)).toBe("/staff/1");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      query: { page: 1, size: 25 },
    });
    expect(table.props("table").data).toEqual([STAFF]);
    expect(useHead).toHaveBeenCalledWith({ title: "Staff" });
  });
});

describe("new member page", () => {
  it("opens the editor on no record", () => {
    const wrapper = mount(New, { global: { stubs: { StaffEditor: true } } });
    expect(wrapper.findComponent(PageHeader).props("title")).toBe("New member");
    expect(wrapper.findComponent(StaffEditor).props("record")).toBeNull();
    expect(useHead).toHaveBeenCalledWith({ title: "New member" });
  });
});

describe("member page", () => {
  it("opens the editor on the member the address names", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => STAFF),
    );
    setRoutePath("/staff/1", { id: "1" });
    const { wrapper, error } = await mountSuspended(Editor);
    expect(error).toBeUndefined();
    expect(wrapper.findComponent(PageHeader).props("title")).toBe("Jane Doe");
    expect(wrapper.findComponent(StaffEditor).props("record")).toEqual(STAFF);
    expect(useHead.mock.calls[0]![0]()).toEqual({ title: "Jane Doe" });
  });

  it("throws a 404 when no member has the id", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    setRoutePath("/staff/9", { id: "9" });
    const { wrapper, error } = await mountSuspended(Editor);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Staff member not found",
    });
    expect(wrapper.findComponent(StaffEditor).exists()).toBe(false);
  });
});
