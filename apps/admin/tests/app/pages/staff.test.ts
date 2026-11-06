import type { StaffRecord } from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { NuxtPage, Table } from "#components";
import { setRoutePath } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import StaffAvatar from "~/components/StaffAvatar.vue";
import StaffBio from "~/components/StaffBio.vue";
import StaffEditor from "~/components/StaffEditor.vue";
import StaffMenu from "~/components/StaffMenu.vue";
import Index from "~/pages/staff/index.vue";
import New from "~/pages/staff/new.vue";
import Member from "~/pages/staff/[id].vue";
import Profile from "~/pages/staff/[id]/profile.vue";
import { STAFF } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

/** The staff page over the admin's API listing the members given. */
const mountStaff = async (items: StaffRecord[]) => {
  const fetch = vi.fn(async () => ({ items, total: items.length }));
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

describe("staff page", () => {
  it("heads the staff table with the way to a new member, its first page fetched on load", async () => {
    const { wrapper, fetch } = await mountStaff([STAFF]);
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Staff",
      description:
        "The people who serve the church, as the site introduces them.",
      to: "/staff/new",
      action: "New member",
    });
    const table = wrapper.findComponent(Table);
    expect(table.props("service").id).toBe("staff");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      query: { page: 1, size: 25 },
    });
    expect(table.props("service").data).toEqual([STAFF]);
    expect(head()).toEqual({ title: "Staff" });
  });

  it("lists the members under the columns shown at first, the row's actions after them", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    expect(wrapper.find(".f-data-table table").exists()).toBe(true);
    expect(
      wrapper
        .findAll(".f-th:not(.f-data-table-actions)")
        .map((th) => th.text()),
    ).toEqual(["Name", "Role", "Status", "Email", "Phone", "Updated"]);
    expect(wrapper.find(".f-th.f-data-table-actions").exists()).toBe(true);
  });

  it("sorts by a heading when it is clicked, and marks the sorted one", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    const heading = wrapper
      .findAll(".f-th")
      .find((th) => th.text() === "Email")!;
    expect(heading.classes()).toContain("f-data-table-sortable");
    expect(heading.classes()).not.toContain("f-data-table-sorted");
    await heading.find("button").trigger("click");
    await flushPromises();
    expect(heading.classes()).toContain("f-data-table-sorted");
  });

  it("opens a panel of options under the search box when it takes focus", async () => {
    // The panel windows its rows by the viewport's measured height, which
    // happy-dom lays out as nothing: hand it one, and keep the resize
    // observer from taking it back.
    const view = document.defaultView!;
    const Observer = view.ResizeObserver;
    view.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    const height = vi
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockReturnValue(256);
    try {
      const { wrapper } = await mountStaff([STAFF]);
      const input = wrapper.find(".f-data-table-search .f-autocomplete-input");
      expect(input.exists()).toBe(true);
      await input.trigger("focus");
      await flushPromises();
      const viewport = wrapper.find(
        ".f-autocomplete-content > .f-autocomplete-viewport",
      );
      expect(viewport.exists()).toBe(true);
      expect(
        viewport.findAll(".f-autocomplete-item").map((item) => item.text()),
      ).toEqual([
        "Search",
        "Name",
        "Role",
        "Status",
        "Email",
        "Phone",
        "Summary",
        "Photo URL",
        "Updated",
        "Created",
      ]);
    } finally {
      height.mockRestore();
      view.ResizeObserver = Observer;
    }
  });

  it("makes the name of each row the way to the member's editor", async () => {
    const { wrapper } = await mountStaff([
      STAFF,
      { ...STAFF, id: 2, name: "John Roe" },
    ]);
    const links = wrapper.findAll(".f-td > a.f-anchor");
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/staff/1/profile",
      "/staff/2/profile",
    ]);
    expect(links.map((link) => link.attributes("target"))).toEqual([
      undefined,
      undefined,
    ]);
    expect(links.map((link) => link.text())).toEqual(["Jane Doe", "John Roe"]);
  });

  it("says when there is nothing to list", async () => {
    const { wrapper } = await mountStaff([]);
    expect(wrapper.find(".f-data-table-empty").exists()).toBe(true);
    expect(wrapper.find(".f-td > a.f-anchor").exists()).toBe(false);
  });
});

describe("new member page", () => {
  it("opens the editor on no record", () => {
    const wrapper = mount(New, { global: { stubs: { StaffEditor: true } } });
    expect(wrapper.findComponent(PageHeader).props()).toMatchObject({
      title: "New member",
      back: { label: "Staff", to: "/staff", icon: "chevron-left" },
    });
    expect(wrapper.findComponent(StaffMenu).exists()).toBe(false);
    expect(wrapper.findComponent(StaffEditor).props("record")).toBeNull();
    expect(head()).toEqual({ title: "New member" });
  });
});

describe("member page", () => {
  const mountMember = async (path = "/staff/1/profile") => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => STAFF),
    );
    setRoutePath(path, { id: "1" });
    return mountSuspended(Member);
  };

  it("heads the member the address names, and hands them to the page under it", async () => {
    const { wrapper, error } = await mountMember();
    expect(error).toBeUndefined();
    const header = wrapper.findComponent(PageHeader);
    expect(header.props()).toMatchObject({
      title: "Jane Doe",
      description: "Has served since 2010.",
      back: { label: "Staff", to: "/staff", icon: "chevron-left" },
    });
    const back = header.find("a.page-header-back");
    expect(back.attributes("href")).toBe("/staff");
    expect(back.find("use").attributes("href")).toBe("#chevron-left");
    expect(header.findComponent(StaffMenu).props("record")).toEqual(STAFF);
    expect(wrapper.findComponent(NuxtPage).props("record")).toEqual(STAFF);
    expect(head()).toEqual({ title: "Jane Doe" });
  });

  it("offers the member's pages as tabs, their profile the first and only one, lit when read", async () => {
    const { wrapper } = await mountMember();
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Profile", to: "/staff/1/profile" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(tabs.map((tab) => [tab.element.tagName, tab.text()])).toEqual([
      ["A", "Profile"],
    ]);
    expect(tabs[0]?.attributes("href")).toBe("/staff/1/profile");
    expect(tabs[0]?.attributes("data-state")).toBe("active");
  });

  it("names the member afresh once the page under it saves their details", async () => {
    const { wrapper } = await mountMember();
    wrapper.findComponent(NuxtPage).vm.$emit("saved", {
      ...STAFF,
      name: "Jane Roe",
      summary: "Since 2010.",
    });
    await flushPromises();
    expect(wrapper.find(".page-header-title").text()).toBe("Jane Roe");
    expect(wrapper.find(".page-header-description").text()).toBe("Since 2010.");
    expect(head()).toEqual({ title: "Jane Roe" });
  });

  it("describes the member by their summary, or not at all", async () => {
    const { wrapper } = await mountMember();
    expect(wrapper.find(".page-header-description").text()).toBe(
      "Has served since 2010.",
    );
    const { summary: _, ...bare } = STAFF;
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => bare),
    );
    const { wrapper: plain } = await mountSuspended(Member);
    expect(plain.find(".page-header-description").exists()).toBe(false);
  });

  it("throws a 404 when no member has the id", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    setRoutePath("/staff/9/profile", { id: "9" });
    const { wrapper, error } = await mountSuspended(Member);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Staff member not found",
    });
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });
});

describe("profile page", () => {
  it("lays the member out in two panels: their photo over their details, then their bio", () => {
    const wrapper = mount(Profile, { props: { record: STAFF } });
    const panels = wrapper.find(".staff-page").element.children;
    expect([...panels].map((panel) => panel.className)).toEqual([
      "staff-page-side",
      "staff-bio",
    ]);
    const side = wrapper.find(".staff-page-side");
    expect([...side.element.children].map((child) => child.className)).toEqual([
      "staff-avatar",
      "staff-editor",
    ]);
    expect(side.findComponent(StaffAvatar).props("record")).toEqual(STAFF);
    expect(side.findComponent(StaffEditor).props("record")).toEqual(STAFF);
    expect(side.findComponent(StaffBio).exists()).toBe(false);
    expect(wrapper.findComponent(StaffBio).props("record")).toEqual(STAFF);
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("passes the record the form saved up to the page around it", () => {
    const wrapper = mount(Profile, { props: { record: STAFF } });
    const changed = { ...STAFF, name: "Jane Roe" };
    wrapper.findComponent(StaffEditor).vm.$emit("saved", changed);
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
  });
});
