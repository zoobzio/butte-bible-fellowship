import type { StaffRecord, ViewRecord } from "@bbf/schema/types";
import type { DOMWrapper } from "@vue/test-utils";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Dialog, Editor, NuxtPage, Table, Views } from "#components";
import { setRoutePath, useRouter } from "#imports";
import Select from "@zoobzio/vue/components/select.vue";
import PageHeader from "~/components/PageHeader.vue";
import SaveBar from "~/components/SaveBar.vue";
import StaffAvatar from "~/components/StaffAvatar.vue";
import StaffBio from "~/components/StaffBio.vue";
import StaffEditor from "~/components/StaffEditor.vue";
import StaffMenu from "~/components/StaffMenu.vue";
import Index from "~/pages/staff/index.vue";
import Member from "~/pages/staff/[id].vue";
import Profile from "~/pages/staff/[id]/profile.vue";
import { STAFF } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

/** A view of the staff someone saved: the elders, by name, fifty to a page. */
const ELDERS: ViewRecord = {
  id: "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f",
  surface: "staff",
  name: "Elders",
  payload: {
    sorting: [{ id: "name", desc: true }],
    // A view holds every column it hides: the table's own three, and one more.
    columnVisibility: {
      phone: false,
      summary: false,
      photo: false,
      createdAt: false,
    },
    pageSize: 50,
    clauses: [{ kind: "filter", key: "role", op: "is", value: "elder" }],
  },
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/**
 * The staff page over the admin's API listing the members given, and
 * holding the views given as whoever is signed in has saved them.
 */
const mountStaff = async (items: StaffRecord[], saved: ViewRecord[] = []) => {
  const fetch = vi.fn(async (path: string, _request?: object) =>
    path.startsWith("/api/views/") ? saved : { items, total: items.length },
  );
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

type Mounted = Awaited<ReturnType<typeof mountStaff>>["wrapper"];

/** The page's own dialog, the new member's: the views have theirs too. */
const adding = (wrapper: Mounted) =>
  wrapper
    .findAllComponents(Dialog)
    .find((dialog) => dialog.props("title") === "New member")!;

/**
 * What a heading is named: its label alone, the button the column is
 * pinned from left out. The select and actions headings have none.
 */
const named = (th: { find: (selector: string) => DOMWrapper<Element> }) => {
  const label = th.find(".f-data-table-header, .f-data-table-header-btn");
  return label.exists() ? label.text() : "";
};

describe("staff page", () => {
  it("heads the staff table with the way to a new member, its first page fetched on load", async () => {
    const { wrapper, fetch } = await mountStaff([STAFF]);
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Staff",
      description:
        "The people who serve the church, as the site introduces them.",
      action: "New member",
    });
    expect(wrapper.find("a.page-header-action").exists()).toBe(false);
    const table = wrapper.findComponent(Table);
    expect(table.props("service").id).toBe("staff");
    // The views load first, so the table's one fetch reads the open one.
    expect(fetch.mock.calls).toEqual([
      ["/api/views/staff", {}],
      ["/api/staff", { query: { page: 1, size: 25 } }],
    ]);
    expect(table.props("service").data).toEqual([STAFF]);
    expect(head()).toEqual({ title: "Staff" });
  });

  it("lists the members under the columns shown at first, the row's actions after them", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    // The table sits in its scroller, which is the card that scrolls it.
    expect(wrapper.find(".f-data-table-scroller table.f-table").exists()).toBe(
      true,
    );
    expect(
      wrapper
        .findAll(".f-th:not(.f-data-table-select, .f-data-table-actions)")
        .map(named),
    ).toEqual(["Name", "Role", "Email", "Phone", "Updated"]);
    expect(wrapper.find(".f-th.f-data-table-select").exists()).toBe(true);
    expect(wrapper.find(".f-th.f-data-table-actions").exists()).toBe(true);
  });

  it("sorts by a heading when it is clicked, and marks the sorted one", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    const heading = wrapper
      .findAll(".f-th")
      .find((th) => named(th) === "Email")!;
    expect(heading.classes()).toContain("f-data-table-sortable");
    expect(heading.classes()).not.toContain("f-data-table-sorted");
    expect(heading.attributes("aria-sort")).toBeUndefined();
    await heading.find("button").trigger("click");
    await flushPromises();
    expect(heading.classes()).toContain("f-data-table-sorted");
    expect(heading.attributes("aria-sort")).toBe("ascending");
  });

  it("pins a column from its heading, to hold its side of the table, as a view then saves it", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    const service = wrapper.findComponent(Table).props("service");
    const heading = () =>
      wrapper.findAll(".f-th").find((th) => named(th) === "Role")!;
    // Every column offers it, and none is pinned to start with: the row's
    // actions alone hold the end.
    expect(heading().find(".f-data-table-pin").exists()).toBe(true);
    expect(heading().classes()).not.toContain("f-data-table-pinned");
    expect(service.snapshot().columnPinning).toEqual({ start: [], end: [] });
    expect(wrapper.find(".f-th.f-data-table-actions").classes()).toContain(
      "f-data-table-pinned-end",
    );

    service.table.getColumn("role").pin("start");
    await flushPromises();
    // Pinned, it leads the columns, and the select column holds the start
    // with it.
    expect(
      wrapper
        .findAll(".f-th:not(.f-data-table-select, .f-data-table-actions)")
        .map(named),
    ).toEqual(["Role", "Name", "Email", "Phone", "Updated"]);
    expect(heading().classes()).toEqual(
      expect.arrayContaining([
        "f-data-table-pinned",
        "f-data-table-pinned-start",
        "f-data-table-pinned-edge",
      ]),
    );
    expect(wrapper.find(".f-th.f-data-table-select").classes()).toContain(
      "f-data-table-pinned-start",
    );
    expect(service.snapshot().columnPinning).toEqual({
      start: ["role"],
      end: [],
    });
  });

  it("leaves a column the API does not sort by as plain text, and the name out of what can be hidden", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    const service = wrapper.findComponent(Table).props("service");
    service.table.getColumn("summary").toggleVisibility(true);
    await flushPromises();
    const heading = wrapper
      .findAll(".f-th")
      .find((th) => named(th) === "Summary")!;
    expect(heading.classes()).not.toContain("f-data-table-sortable");
    expect(heading.find(".f-data-table-header-btn").exists()).toBe(false);
    service.table.getColumn("name").toggleVisibility(false);
    await flushPromises();
    expect(wrapper.findAll(".f-th").some((th) => named(th) === "Name")).toBe(
      true,
    );
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

describe("staff selection", () => {
  const JOHN: StaffRecord = { ...STAFF, id: 2, name: "John Roe" };

  /** The API's writes: every call that is not a read. */
  const writes = (fetch: Awaited<ReturnType<typeof mountStaff>>["fetch"]) =>
    fetch.mock.calls.filter(
      ([, request]) => request !== undefined && "method" in request,
    );

  /** Ticks the row of each member given, by the box its row leads with. */
  const select = async (wrapper: Mounted, ...rows: number[]) => {
    const boxes = wrapper.findAll(
      ".f-tbody .f-data-table-select [role=checkbox]",
    );
    for (const row of rows) await boxes[row]!.trigger("click");
  };

  /** Presses a button of the bar over the selection, by its label. */
  const press = (wrapper: Mounted, label: string) =>
    wrapper
      .findAll(".f-data-table-bulk-actions button")
      .find((button) => button.text() === label)!
      .trigger("click");

  it("offers nothing over the rows until one is selected, then how many are, and their removal", async () => {
    const { wrapper } = await mountStaff([STAFF, JOHN]);
    expect(wrapper.find(".f-data-table-bulk-actions").exists()).toBe(false);
    await select(wrapper, 0, 1);
    expect(wrapper.find(".f-data-table-bulk-actions-count").text()).toBe(
      "2 selected",
    );
    expect(
      wrapper
        .findAll(".f-data-table-bulk-actions button")
        .map((button) => button.text()),
    ).toEqual(["Delete", "Clear"]);
  });

  it("removes the members selected, once asked by their count, and lists the staff afresh with none selected", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const { wrapper, fetch } = await mountStaff([STAFF, JOHN]);
    await select(wrapper, 0, 1);
    await press(wrapper, "Delete");
    await flushPromises();
    expect(confirm).toHaveBeenCalledWith(
      "Delete 2 members? This cannot be undone.",
    );
    expect(writes(fetch)).toEqual([
      ["/api/staff/1", { method: "DELETE" }],
      ["/api/staff/2", { method: "DELETE" }],
    ]);
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: { page: 1, size: 25 },
    });
    expect(wrapper.find(".f-data-table-bulk-actions").exists()).toBe(false);
    expect(wrapper.find(".staff-error").exists()).toBe(false);
  });

  it("asks about one member as one, and keeps them when the question is declined", async () => {
    const confirm = vi.fn(() => false);
    vi.stubGlobal("confirm", confirm);
    const { wrapper, fetch } = await mountStaff([STAFF, JOHN]);
    await select(wrapper, 1);
    await press(wrapper, "Delete");
    await flushPromises();
    expect(confirm).toHaveBeenCalledWith(
      "Delete 1 member? This cannot be undone.",
    );
    expect(writes(fetch)).toEqual([]);
    expect(wrapper.find(".f-data-table-bulk-actions-count").text()).toBe(
      "1 selected",
    );
  });

  it("says why a member was not removed and keeps them selected, the rest removed, until the next try", async () => {
    vi.stubGlobal("confirm", () => true);
    const { wrapper, fetch } = await mountStaff([STAFF, JOHN]);
    const listing = fetch.getMockImplementation()!;
    fetch.mockImplementation(async (path, request) => {
      if (path === "/api/staff/2") throw new Error("The server is away.");
      return listing(path, request);
    });
    await select(wrapper, 0, 1);
    await press(wrapper, "Delete");
    await flushPromises();
    expect(wrapper.find(".staff-error").text()).toBe("The server is away.");
    expect(wrapper.find(".staff-error").attributes("role")).toBe("alert");
    expect(wrapper.find(".f-data-table-bulk-actions-count").text()).toBe(
      "1 selected",
    );
    expect(
      wrapper.findAll(".f-tbody .f-tr.f-data-table-selected"),
    ).toHaveLength(1);
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: { page: 1, size: 25 },
    });

    fetch.mockImplementation(listing);
    await press(wrapper, "Delete");
    await flushPromises();
    expect(writes(fetch).at(-1)).toEqual([
      "/api/staff/2",
      { method: "DELETE" },
    ]);
    expect(wrapper.find(".staff-error").exists()).toBe(false);
    expect(wrapper.find(".f-data-table-bulk-actions").exists()).toBe(false);
  });

  it("counts a member already gone as removed", async () => {
    vi.stubGlobal("confirm", () => true);
    const { wrapper, fetch } = await mountStaff([STAFF]);
    const listing = fetch.getMockImplementation()!;
    fetch.mockImplementation(async (path, request) => {
      if (path === "/api/staff/1") throw { status: 404 };
      return listing(path, request);
    });
    await select(wrapper, 0);
    await press(wrapper, "Delete");
    await flushPromises();
    expect(wrapper.find(".staff-error").exists()).toBe(false);
    expect(wrapper.find(".f-data-table-bulk-actions").exists()).toBe(false);
  });

  it("goes back to the last page there is when the one it was on is removed whole", async () => {
    vi.stubGlobal("confirm", () => true);
    const { wrapper, fetch } = await mountStaff([STAFF]);
    const { table } = wrapper.findComponent(Table).props("service");
    // The second page of twenty-six holds the one member; then they go.
    fetch.mockImplementation(async () => ({ items: [STAFF], total: 26 }));
    table.setPageIndex(1);
    await flushPromises();
    await select(wrapper, 0);
    fetch.mockImplementation(async (_path, request) =>
      (request as { query?: { page: number } })?.query?.page === 2
        ? { items: [], total: 25 }
        : { items: [JOHN], total: 25 },
    );
    await press(wrapper, "Delete");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/staff", {
      query: { page: 1, size: 25 },
    });
    expect(wrapper.findAll(".f-tbody .f-tr")).toHaveLength(1);
  });
});

describe("staff views", () => {
  const services = (wrapper: Mounted) => ({
    views: wrapper.findComponent(Views).props("service"),
    table: wrapper.findComponent(Table).props("service"),
  });

  const ids = (views: { views: { id: string }[] }) =>
    views.views.map((view) => view.id);

  it("opens on the admin's own view, the table as it starts, with nothing edited", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    const { views, table } = services(wrapper);
    expect(views.id).toBe("staff");
    expect(views.initialized).toBe(true);
    expect(views.views).toMatchObject([
      { id: "all", name: "admin.staff.allView", origin: "system" },
    ]);
    expect(views.active).toBe("all");
    expect(views.current.payload).toEqual(table.snapshot());
    expect(views.drifted).toBe(false);
    expect(views.editable).toBe(false);
    expect(wrapper.find(".f-views").classes()).not.toContain("f-views-drifted");
    expect(wrapper.findAll(".f-views-tabs .f-tabs-trigger")).toHaveLength(1);
  });

  it("lists the views whoever is signed in has saved after it, each their own, a tab apiece", async () => {
    const { wrapper } = await mountStaff([STAFF], [ELDERS]);
    const { views } = services(wrapper);
    expect(views.views).toMatchObject([
      { id: "all", origin: "system" },
      { id: ELDERS.id, name: "Elders", origin: "user" },
    ]);
    expect(views.stale).toEqual([]);
    expect(wrapper.findAll(".f-views-tabs .f-tabs-trigger")).toHaveLength(2);
    expect(wrapper.find(".f-views-tabs").text()).toContain("Elders");
  });

  it("puts a view picked in place, and lists the staff afresh as it arranges them", async () => {
    const { wrapper, fetch } = await mountStaff([STAFF], [ELDERS]);
    const { views, table } = services(wrapper);
    fetch.mockClear();
    expect(await views.select(ELDERS.id)).toBe(true);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        "/api/staff",
        {
          query: {
            page: 1,
            size: 50,
            roleIs: "elder",
            sort: "name",
            direction: "desc",
          },
        },
      ],
    ]);
    expect(views.active).toBe(ELDERS.id);
    expect(views.editable).toBe(true);
    expect(views.drifted).toBe(false);
    expect(
      table.table
        .getVisibleLeafColumns()
        .map((column: { id: string }) => column.id),
    ).toEqual(["name", "role", "email", "updatedAt"]);
  });

  it("marks the open view as edited once the table moves off it, and holds a view picked over the edit", async () => {
    const { wrapper } = await mountStaff([STAFF], [ELDERS]);
    const { views, table } = services(wrapper);
    table.table.setSorting([{ id: "email", desc: false }]);
    await flushPromises();
    expect(views.drifted).toBe(true);
    expect(wrapper.find(".f-views").classes()).toContain("f-views-drifted");
    expect(wrapper.find(".f-views-badge").exists()).toBe(true);
    expect(await views.select(ELDERS.id)).toBe(false);
    expect(views.pending).toEqual({ kind: "select", id: ELDERS.id });
    await views.resolve("cancel");
    expect(views.active).toBe("all");
    table.table.setSorting([]);
    await flushPromises();
    expect(views.drifted).toBe(false);
  });

  it("saves the table as it stands as a view of the user's own, through the API", async () => {
    const { wrapper, fetch } = await mountStaff([STAFF]);
    const { views, table } = services(wrapper);
    table.table.setSorting([{ id: "email", desc: true }]);
    await flushPromises();
    fetch.mockClear();
    const view = await views.saveAs("By email");
    expect(view.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(fetch.mock.calls).toEqual([
      [
        `/api/views/staff/${view.id}`,
        {
          method: "PUT",
          body: {
            name: "By email",
            payload: {
              ...views.views[0].payload,
              sorting: [{ id: "email", desc: true }],
            },
          },
        },
      ],
    ]);
    expect(views.active).toBe(view.id);
    expect(views.editable).toBe(true);
    expect(views.drifted).toBe(false);
  });

  it("saves over a view of the user's own, and removes it, through the API", async () => {
    const { wrapper, fetch } = await mountStaff([STAFF], [ELDERS]);
    const { views, table } = services(wrapper);
    await views.select(ELDERS.id);
    table.table.setPageSize(10);
    await flushPromises();
    expect(views.drifted).toBe(true);
    fetch.mockClear();
    await views.save();
    expect(fetch.mock.calls).toEqual([
      [
        `/api/views/staff/${ELDERS.id}`,
        {
          method: "PUT",
          body: {
            name: "Elders",
            payload: expect.objectContaining({ pageSize: 10 }),
          },
        },
      ],
    ]);
    expect(views.drifted).toBe(false);

    fetch.mockClear();
    await views.remove(ELDERS.id, { force: true });
    await flushPromises();
    expect(fetch.mock.calls[0]).toEqual([
      `/api/views/staff/${ELDERS.id}`,
      { method: "DELETE" },
    ]);
    expect(ids(views)).toEqual(["all"]);
    expect(views.active).toBe("all");
  });

  it("sets a view its schema no longer accepts aside, and never applies it", async () => {
    const stale = {
      ...ELDERS,
      payload: { sorting: [{ id: "bio", desc: false }] },
    };
    const { wrapper } = await mountStaff([STAFF], [stale]);
    const { views } = services(wrapper);
    expect(ids(views)).toEqual(["all"]);
    expect(views.stale).toMatchObject([{ id: ELDERS.id, name: "Elders" }]);
    expect(views.drifted).toBe(false);
  });
});

describe("new member dialog", () => {
  const open = async () => {
    const mounted = await mountStaff([STAFF]);
    await mounted.wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    return mounted;
  };

  it("stays shut until a new member is asked for", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    expect(adding(wrapper).props("open")).toBe(false);
    expect(wrapper.findComponent(StaffEditor).exists()).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("opens the editor on no record, over the list, named and described", async () => {
    const { wrapper } = await open();
    const dialog = adding(wrapper);
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "New member",
      description:
        "Their details come first. Their photo and bio are added on their page, once they are saved.",
    });
    const content = document.body.querySelector(".f-dialog-content")!;
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.querySelector(".f-dialog-title")?.textContent?.trim()).toBe(
      "New member",
    );
    expect(dialog.findComponent(StaffEditor).props("record")).toBeNull();
    expect(wrapper.findComponent(Table).exists()).toBe(true);
    expect(head()).toEqual({ title: "Staff" });
  });

  it("shuts from its corner, and opens blank the next time", async () => {
    const { wrapper } = await open();
    const editor = adding(wrapper).findComponent(StaffEditor);
    await editor.find("#staff-name").setValue("John Roe");
    // The dialog is drawn on the body, outside the page's own element.
    const close = document.body.querySelector<HTMLButtonElement>(
      ".f-dialog-content .staff-new-close",
    )!;
    expect(close.getAttribute("aria-label")).toBe("Cancel");
    close.click();
    await flushPromises();
    expect(adding(wrapper).props("open")).toBe(false);
    expect(wrapper.findComponent(StaffEditor).exists()).toBe(false);
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    const name = wrapper.findComponent(StaffEditor).find("#staff-name");
    expect((name.element as HTMLInputElement).value).toBe("");
  });

  it("writes the member and leads on to their page", async () => {
    const { wrapper } = await open();
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const editor = adding(wrapper).findComponent(StaffEditor);
    await editor.find("#staff-name").setValue("John Roe");
    editor
      .findComponent(Select)
      .vm.$emit("update:modelValue", { value: "staff", label: "Staff" });
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/staff/1/profile"),
    );
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: { name: "John Roe", role: "staff" },
    });
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
      "save-bar",
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

  it("lists the headings of the member's bio under their details, each linked to its own", async () => {
    const bio = {
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
    const wrapper = mount(Profile, {
      props: { record: { ...STAFF, bio } },
    });
    await wrapper.vm.$nextTick();
    const link = wrapper.find(
      ".staff-page-side > .staff-editor + nav.toc a.toc-link",
    );
    expect(link.text()).toBe("Our Vision");
    expect(link.attributes("href")).toBe("#our-vision");
    expect(wrapper.find(".staff-bio h2#our-vision").exists()).toBe(true);
  });

  it("lists nothing under the details of a member whose bio has no headings", async () => {
    const wrapper = mount(Profile, { props: { record: STAFF } });
    await wrapper.vm.$nextTick();
    expect(wrapper.find("nav.toc").exists()).toBe(false);
  });

  it("passes the record the form saved up to the page around it", () => {
    const wrapper = mount(Profile, { props: { record: STAFF } });
    const changed = { ...STAFF, name: "Jane Roe" };
    wrapper.findComponent(StaffEditor).vm.$emit("saved", changed);
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
  });

  /** The page, drawn on the screen, with its bar's two buttons. */
  const mountWhole = () => {
    const wrapper = mount(Profile, {
      props: { record: STAFF },
      attachTo: document.body,
    });
    return {
      wrapper,
      save: wrapper.find("button.save-bar-save"),
      reset: wrapper.find("button.save-bar-reset"),
      content: () => wrapper.find(".staff-bio .f-data-editor-content"),
    };
  };

  /** Writes over the whole of what is written, as typing over a selection does. */
  const write = async (page: ReturnType<typeof mountWhole>, text: string) => {
    await page.content().trigger("pointerdown");
    await page.wrapper.vm.$nextTick();
    page.wrapper
      .findComponent(StaffBio)
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
    const changed = { ...STAFF, name: "Jane Roe" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    await page.wrapper.find("#staff-name").setValue("Jane Roe");
    await write(page, "Since 2010.");
    expect(page.save.attributes("disabled")).toBeUndefined();
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {
      method: "PUT",
      body: expect.objectContaining({ name: "Jane Roe" }),
    });
    expect(fetch).toHaveBeenCalledWith("/api/staff/1/bio", {
      method: "PATCH",
      body: { bio: expect.objectContaining({ type: "root" }) },
    });
    expect(page.wrapper.emitted("saved")).toEqual([[changed]]);
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("saves only the panel that changed", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    await write(page, "Since 2010.");
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/staff/1/bio", expect.anything());
  });

  it("resets the details and what is written at once, to what was last saved", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const page = mountWhole();
    const field = page.wrapper.find("#staff-name");
    await field.setValue("Jane Roe");
    await write(page, "A slip of the keys.");
    expect(page.reset.attributes("disabled")).toBeUndefined();
    await page.reset.trigger("click");
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect((field.element as HTMLInputElement).value).toBe("Jane Doe");
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
    await page.wrapper.find("#staff-name").setValue("Jane Roe");
    await page.save.trigger("click");
    await flushPromises();
    const errors = page.wrapper.findAll(".save-bar-error");
    expect(errors.map((error) => error.text())).toEqual([
      "The server is away.",
    ]);
    expect(page.save.attributes("disabled")).toBeUndefined();
  });
});
