import type { StaffRecord } from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Dialog, Editor, NuxtPage, Table } from "#components";
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
      action: "New member",
    });
    expect(wrapper.find("a.page-header-action").exists()).toBe(false);
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
    ).toEqual(["Name", "Role", "Email", "Phone", "Updated"]);
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

describe("new member dialog", () => {
  const open = async () => {
    const mounted = await mountStaff([STAFF]);
    await mounted.wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    return mounted;
  };

  it("stays shut until a new member is asked for", async () => {
    const { wrapper } = await mountStaff([STAFF]);
    expect(wrapper.findComponent(Dialog).props("open")).toBe(false);
    expect(wrapper.findComponent(StaffEditor).exists()).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("opens the editor on no record, over the list, named and described", async () => {
    const { wrapper } = await open();
    const dialog = wrapper.findComponent(Dialog);
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
    const editor = wrapper.findComponent(Dialog).findComponent(StaffEditor);
    await editor.find("#staff-name").setValue("John Roe");
    // The dialog is drawn on the body, outside the page's own element.
    const close = document.body.querySelector<HTMLButtonElement>(
      ".f-dialog-content .staff-new-close",
    )!;
    expect(close.getAttribute("aria-label")).toBe("Cancel");
    close.click();
    await flushPromises();
    expect(wrapper.findComponent(Dialog).props("open")).toBe(false);
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
    const editor = wrapper.findComponent(Dialog).findComponent(StaffEditor);
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
