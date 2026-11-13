import type { ContentRecord } from "@bbf/schema/types";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Dialog, NuxtPage, Table } from "#components";
import { setRoutePath, useRouter } from "#imports";
import ContentBody from "~/components/ContentBody.vue";
import ContentEditor from "~/components/ContentEditor.vue";
import ContentMenu from "~/components/ContentMenu.vue";
import PageHeader from "~/components/PageHeader.vue";
import Index from "~/pages/content/index.vue";
import Content from "~/pages/content/[id].vue";
import Page from "~/pages/content/[id]/page.vue";
import { HOME, ABOUT } from "#test/support/records";
import { head } from "#test/support/head";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

/** The content page over the admin's API listing the pages given. */
const mountContent = async (items: ContentRecord[]) => {
  const fetch = vi.fn(async () => ({ items, total: items.length }));
  vi.stubGlobal("$fetch", fetch);
  const { wrapper, error } = await mountSuspended(Index);
  expect(error).toBeUndefined();
  return { wrapper, fetch };
};

describe("content page", () => {
  it("heads the content table with the way to a new page, its first page fetched on load", async () => {
    const { wrapper, fetch } = await mountContent([HOME, ABOUT]);
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: "Content",
      description:
        "The pages of the site: what each says, and what search engines show for it.",
      action: "New page",
    });
    expect(wrapper.find("a.page-header-action").exists()).toBe(false);
    const table = wrapper.findComponent(Table);
    expect(table.props("service").id).toBe("content");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/content", {
      query: { page: 1, size: 25 },
    });
    expect(table.props("service").data).toEqual([HOME, ABOUT]);
    expect(head()).toEqual({ title: "Content" });
  });

  it("lists the pages under the columns shown at first, the row's actions after them", async () => {
    const { wrapper } = await mountContent([HOME]);
    expect(wrapper.find(".f-data-table table").exists()).toBe(true);
    expect(
      wrapper
        .findAll(".f-th:not(.f-data-table-actions)")
        .map((th) => th.text()),
    ).toEqual(["Title", "Slug", "Description", "Updated"]);
    expect(wrapper.find(".f-th.f-data-table-actions").exists()).toBe(true);
  });

  it("sorts by a heading when it is clicked, and marks the sorted one", async () => {
    const { wrapper } = await mountContent([HOME]);
    const heading = wrapper
      .findAll(".f-th")
      .find((th) => th.text() === "Slug")!;
    expect(heading.classes()).toContain("f-data-table-sortable");
    expect(heading.classes()).not.toContain("f-data-table-sorted");
    await heading.find("button").trigger("click");
    await flushPromises();
    expect(heading.classes()).toContain("f-data-table-sorted");
  });

  it("searches: the table carries a search box", async () => {
    const { wrapper } = await mountContent([HOME]);
    expect(
      wrapper.find(".f-data-table-search .f-autocomplete-input").exists(),
    ).toBe(true);
  });

  it("makes the title of each row the way to the page's editor", async () => {
    const { wrapper } = await mountContent([HOME, ABOUT]);
    const links = wrapper.findAll(".f-td > a.f-anchor");
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/content/5/page",
      "/content/6/page",
    ]);
    expect(links.map((link) => link.text())).toEqual([
      "Butte Bible Fellowship",
      "About Us",
    ]);
  });

  it("says when there is nothing to list", async () => {
    const { wrapper } = await mountContent([]);
    expect(wrapper.find(".f-data-table-empty").exists()).toBe(true);
    expect(wrapper.find(".f-td > a.f-anchor").exists()).toBe(false);
  });
});

describe("new page dialog", () => {
  const open = async () => {
    const mounted = await mountContent([HOME]);
    await mounted.wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    return mounted;
  };

  it("stays shut until a new page is asked for", async () => {
    const { wrapper } = await mountContent([HOME]);
    expect(wrapper.findComponent(Dialog).props("open")).toBe(false);
    expect(wrapper.findComponent(ContentEditor).exists()).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("opens the editor on no record, over the list, named and described", async () => {
    const { wrapper } = await open();
    const dialog = wrapper.findComponent(Dialog);
    expect(dialog.props()).toMatchObject({
      open: true,
      title: "New page",
      description:
        "Its metadata comes first. What is written on it is added on its own page, once it is saved.",
    });
    const content = document.body.querySelector(".f-dialog-content")!;
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.querySelector(".f-dialog-title")?.textContent?.trim()).toBe(
      "New page",
    );
    expect(dialog.findComponent(ContentEditor).props("record")).toBeNull();
    expect(wrapper.findComponent(Table).exists()).toBe(true);
    expect(head()).toEqual({ title: "Content" });
  });

  it("shuts from its corner, and opens blank the next time", async () => {
    const { wrapper } = await open();
    const editor = wrapper.findComponent(Dialog).findComponent(ContentEditor);
    await editor.find("#content-title").setValue("Membership");
    // The dialog is drawn on the body, outside the page's own element.
    const close = document.body.querySelector<HTMLButtonElement>(
      ".f-dialog-content .content-new-close",
    )!;
    expect(close.getAttribute("aria-label")).toBe("Cancel");
    close.click();
    await flushPromises();
    expect(wrapper.findComponent(Dialog).props("open")).toBe(false);
    expect(wrapper.findComponent(ContentEditor).exists()).toBe(false);
    await wrapper.find("button.page-header-action").trigger("click");
    await flushPromises();
    const title = wrapper.findComponent(ContentEditor).find("#content-title");
    expect((title.element as HTMLInputElement).value).toBe("");
  });

  it("writes the page and leads on to its own page", async () => {
    const { wrapper } = await open();
    const fetch = vi.fn(async () => ABOUT);
    vi.stubGlobal("$fetch", fetch);
    const editor = wrapper.findComponent(Dialog).findComponent(ContentEditor);
    await editor.find("#content-title").setValue("About Us");
    await editor.find("#content-slug").setValue("about-us");
    await editor.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/content/6/page"),
    );
    expect(fetch).toHaveBeenCalledWith("/api/content", {
      method: "POST",
      body: { slug: "about-us", title: "About Us" },
    });
  });
});

describe("a page's page", () => {
  const mountPage = async (path = "/content/5/page") => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => HOME),
    );
    setRoutePath(path, { id: "5" });
    return mountSuspended(Content);
  };

  it("heads the page the address names, and hands it to the page under it", async () => {
    const { wrapper, error } = await mountPage();
    expect(error).toBeUndefined();
    const header = wrapper.findComponent(PageHeader);
    expect(header.props()).toMatchObject({
      title: "Butte Bible Fellowship",
      description: "A local church in Chico.",
      back: { label: "Content", to: "/content", icon: "chevron-left" },
    });
    expect(header.find("a.page-header-back").attributes("href")).toBe(
      "/content",
    );
    expect(header.findComponent(ContentMenu).props("record")).toEqual(HOME);
    expect(wrapper.findComponent(NuxtPage).props("record")).toEqual(HOME);
    expect(head()).toEqual({ title: "Butte Bible Fellowship" });
  });

  it("offers the page's own pages as tabs, the page itself the first and only one, lit when read", async () => {
    const { wrapper } = await mountPage();
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Page", to: "/content/5/page" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(tabs.map((tab) => [tab.element.tagName, tab.text()])).toEqual([
      ["A", "Page"],
    ]);
    expect(tabs[0]?.attributes("href")).toBe("/content/5/page");
    expect(tabs[0]?.attributes("data-state")).toBe("active");
  });

  it("names the page afresh once the page under it saves it", async () => {
    const { wrapper } = await mountPage();
    wrapper.findComponent(NuxtPage).vm.$emit("saved", {
      ...HOME,
      title: "Welcome",
      description: "Come as you are.",
    });
    await flushPromises();
    expect(wrapper.find(".page-header-title").text()).toBe("Welcome");
    expect(wrapper.find(".page-header-description").text()).toBe(
      "Come as you are.",
    );
    expect(head()).toEqual({ title: "Welcome" });
  });

  it("describes the page by its description, or not at all", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ABOUT),
    );
    setRoutePath("/content/6/page", { id: "6" });
    const { wrapper } = await mountSuspended(Content);
    expect(wrapper.find(".page-header-title").text()).toBe("About Us");
    expect(wrapper.find(".page-header-description").exists()).toBe(false);
  });

  it("throws a 404 when no page has the id", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    setRoutePath("/content/9/page", { id: "9" });
    const { wrapper, error } = await mountSuspended(Content);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("throws a 404 for an address that names no number", async () => {
    const fetch = vi.fn(async () => HOME);
    vi.stubGlobal("$fetch", fetch);
    setRoutePath("/content/x/page", { id: "x" });
    const { error } = await mountSuspended(Content);
    expect(error).toMatchObject({ statusCode: 404 });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("page page", () => {
  it("lays the page out in two panels: its metadata, then what is written on it", () => {
    const wrapper = mount(Page, { props: { record: HOME } });
    const panels = wrapper.find(".content-page").element.children;
    expect([...panels].map((panel) => panel.className)).toEqual([
      "content-editor",
      "content-body",
    ]);
    expect(wrapper.findComponent(ContentEditor).props("record")).toEqual(HOME);
    expect(wrapper.findComponent(ContentBody).props("record")).toEqual(HOME);
    expect(wrapper.find(".content-editor-title").text()).toBe("Metadata");
    expect(wrapper.find(".content-body-title").text()).toBe("Content");
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("passes the record the form saved up to the page around it", () => {
    const wrapper = mount(Page, { props: { record: ABOUT } });
    const changed = { ...ABOUT, title: "Messages" };
    wrapper.findComponent(ContentEditor).vm.$emit("saved", changed);
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
  });
});
