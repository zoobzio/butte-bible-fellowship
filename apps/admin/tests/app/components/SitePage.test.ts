import type { Component } from "vue";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

import { Editor } from "#components";
import { HOME_PAGE } from "#test/support/records";
import ContentBody from "~/components/ContentBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import SaveBar from "~/components/SaveBar.vue";
import SiteEditor from "~/components/SiteEditor.vue";
import SitePage from "~/components/SitePage.vue";
import { useHomeEditor } from "~/composables/site/home";

const ADDRESS = "/api/site/home/body";

/** The home page as its content tab draws it: the tab builds the form, and hands it on. */
const mountPage = (record = HOME_PAGE) => {
  const wrapper = mount(
    defineComponent({
      setup() {
        const editor = useHomeEditor(record);
        return () =>
          h(SitePage as Component, { editor, record, address: ADDRESS });
      },
    }),
    { attachTo: document.body },
  );
  return {
    wrapper,
    save: wrapper.find("button.save-bar-save"),
    reset: wrapper.find("button.save-bar-reset"),
    content: () => wrapper.find(".content-body .f-data-editor-content"),
  };
};

/** Writes over the whole of what is written, as typing over a selection does. */
const write = async (page: ReturnType<typeof mountPage>, text: string) => {
  await page.content().trigger("pointerdown");
  await page.wrapper.vm.$nextTick();
  page.wrapper
    .findComponent(ContentBody)
    .findComponent(Editor)
    .props("service")
    .run(
      (chain: {
        selectAll: () => { insertContent: (text: string) => unknown };
      }) => chain.selectAll().insertContent(text),
    );
  await page.wrapper.vm.$nextTick();
};

describe("SitePage", () => {
  it("lays the page out as a page of the content is: its metadata, then what is written on it, then the bar", () => {
    const { wrapper } = mountPage();
    const panels = wrapper.find(".site-page").element.children;
    expect([...panels].map((panel) => panel.className)).toEqual([
      "site-page-side",
      "content-body",
      "save-bar",
    ]);
    expect(wrapper.find(".site-page-side > .site-editor").exists()).toBe(true);
    expect(wrapper.find(".site-editor-title").text()).toBe("Metadata");
    expect(wrapper.find(".content-body-title").text()).toBe("Content");
    expect(wrapper.findComponent(SiteEditor).props("editor").form.id).toBe(
      "home",
    );
    expect(wrapper.findComponent(ContentBody).props()).toEqual({
      record: HOME_PAGE,
      address: ADDRESS,
    });
  });

  it("draws no header of its own: the page around the tab heads it", () => {
    const { wrapper } = mountPage();
    expect(wrapper.findComponent(PageHeader).exists()).toBe(false);
  });

  it("draws what else the tab hands it over the metadata: the home page's picture", () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const editor = useHomeEditor(HOME_PAGE);
          return () =>
            h(
              SitePage as Component,
              { editor, record: HOME_PAGE, address: ADDRESS },
              { default: () => h("section", { class: "picture" }) },
            );
        },
      }),
    );
    expect(
      wrapper.find(".site-page-side > .picture + .site-editor").exists(),
    ).toBe(true);
  });

  it("lists the page's headings under its metadata, each linked to its own", async () => {
    const body = {
      type: "root" as const,
      children: [
        {
          type: "element" as const,
          tagName: "h2",
          properties: {},
          children: [{ type: "text" as const, value: "Welcome" }],
        },
      ],
    };
    const { wrapper } = mountPage({ ...HOME_PAGE, body });
    await wrapper.vm.$nextTick();
    const link = wrapper.find(
      ".site-page-side > .site-editor + nav.toc a.toc-link",
    );
    expect(link.text()).toBe("Welcome");
    expect(link.attributes("href")).toBe("#welcome");
    expect(wrapper.find(".content-body h2#welcome").exists()).toBe(true);
  });

  it("lists nothing under the metadata of a page with no headings", async () => {
    const { wrapper } = mountPage();
    await wrapper.vm.$nextTick();
    expect(wrapper.find("nav.toc").exists()).toBe(false);
  });

  it("ends in one bar that saves the whole page, with nothing to do until something changes", () => {
    const { wrapper, save, reset } = mountPage();
    expect(wrapper.findComponent(SaveBar).props()).toEqual({
      dirty: false,
      open: false,
      saving: false,
      errors: [],
    });
    expect(save.attributes("disabled")).toBeDefined();
    expect(reset.attributes("disabled")).toBeDefined();
    expect(
      wrapper.findAll("button").filter((b) => b.text() === "Save"),
    ).toHaveLength(1);
  });

  it("saves the metadata and what is written at once, each where it is kept", async () => {
    const fetch = vi.fn(async () => ({ ...HOME_PAGE, title: "Welcome" }));
    vi.stubGlobal("$fetch", fetch);
    const page = mountPage();
    await page.wrapper.find("#home-title").setValue("Welcome");
    await write(page, "Since 2010.");
    expect(page.save.attributes("disabled")).toBeUndefined();
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {
      method: "PUT",
      body: expect.objectContaining({ title: "Welcome" }),
    });
    expect(fetch).toHaveBeenCalledWith(ADDRESS, {
      method: "PATCH",
      body: { body: expect.objectContaining({ type: "root" }) },
    });
    expect(page.save.attributes("disabled")).toBeDefined();
    expect(page.reset.attributes("disabled")).toBeDefined();
  });

  it("saves only the panel that changed", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const page = mountPage();
    await page.wrapper.find("#home-heroAction").setValue("Plan a visit");
    await page.save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/site/home", expect.anything());
  });

  it("resets the metadata and what is written at once, to what was last saved", async () => {
    const fetch = vi.fn(async () => HOME_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const page = mountPage();
    const field = page.wrapper.find("#home-title");
    await field.setValue("Welcome");
    await write(page, "A slip of the keys.");
    expect(page.reset.attributes("disabled")).toBeUndefined();
    await page.reset.trigger("click");
    await flushPromises();
    expect(fetch).not.toHaveBeenCalled();
    expect((field.element as HTMLInputElement).value).toBe(
      "Butte Bible Fellowship",
    );
    expect(page.content().text()).toBe("Has served since 2010.");
    expect(page.save.attributes("disabled")).toBeDefined();
  });

  it("says in the bar what went wrong with a save, and keeps what was written to try again", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const page = mountPage();
    await page.wrapper.find("#home-title").setValue("Welcome");
    await page.save.trigger("click");
    await flushPromises();
    expect(
      page.wrapper.findAll(".save-bar-error").map((error) => error.text()),
    ).toEqual(["The server is away."]);
    expect(page.save.attributes("disabled")).toBeUndefined();
  });
});
