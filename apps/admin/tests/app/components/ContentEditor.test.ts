import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { useRouter } from "#imports";
import { mountHeld } from "#test/support/drafts";
import { ABOUT, HOME } from "#test/support/records";
import ContentEditor from "~/components/ContentEditor.vue";

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

describe("ContentEditor", () => {
  it("opens blank for a new page, with no heading of its own: the dialog names it", () => {
    const wrapper = mount(ContentEditor, { props: { record: null } });
    expect(value(wrapper, "content-title")).toBe("");
    expect(value(wrapper, "content-slug")).toBe("");
    expect(value(wrapper, "content-description")).toBe("");
    expect(wrapper.find(".content-editor-title").exists()).toBe(false);
    expect(wrapper.find("form").attributes("aria-labelledby")).toBeUndefined();
  });

  it("opens on a page's record under its heading, every field filled, with a save alone: the page's menu deletes", () => {
    const wrapper = mount(ContentEditor, { props: { record: HOME } });
    const title = wrapper.find("h2.content-editor-title");
    expect(title.text()).toBe("Metadata");
    expect(wrapper.find("form").attributes("aria-labelledby")).toBe(
      title.attributes("id"),
    );
    expect(value(wrapper, "content-title")).toBe("Butte Bible Fellowship");
    expect(value(wrapper, "content-slug")).toBe("index");
    expect(value(wrapper, "content-description")).toBe(
      "A local church in Chico.",
    );
    expect(
      wrapper.findAll('button[type="submit"]').map((b) => b.text()),
    ).toEqual(["Save"]);
    expect(wrapper.text()).not.toContain("Delete");
  });

  it("is one column of a page's metadata, what its front matter carried, with neither a hero nor what is written on it", () => {
    const wrapper = mount(ContentEditor, { props: { record: ABOUT } });
    expect(
      wrapper.findAll(".f-data-form-field label").map((label) => label.text()),
    ).toEqual(["Title", "Slug", "Description"]);
    expect(wrapper.find("textarea#content-description").exists()).toBe(true);
    for (const key of ["body", "hero", "heroTagline", "ctaLabel", "status"]) {
      expect(wrapper.find(`#content-${key}`).exists(), key).toBe(false);
    }
    expect(wrapper.find(".f-data-editor").exists()).toBe(false);
  });

  it("says under a field what it is for, and ties the hint to it", () => {
    const wrapper = mount(ContentEditor, { props: { record: null } });
    const hint = (id: string) => wrapper.find(`#${id}-hint`).text();
    expect(hint("content-slug")).toBe(
      "Lowercase words joined by hyphens. The home page is index.",
    );
    expect(wrapper.find("#content-slug").attributes("aria-describedby")).toBe(
      "content-slug-hint",
    );
  });

  it("labels every control", () => {
    const wrapper = mount(ContentEditor, { props: { record: null } });
    const labels = wrapper.findAll("label");
    expect(labels.length).toBe(3);
    for (const label of labels) {
      const id = label.attributes("for");
      expect(id).toBeDefined();
      expect(wrapper.find(`#${id}`).exists(), id).toBe(true);
    }
  });

  it("saves without the browser's own checks, and leaves the form's title to the page", () => {
    const wrapper = mount(ContentEditor, { props: { record: HOME } });
    expect(wrapper.find("form").attributes("novalidate")).toBeDefined();
    expect(wrapper.find(".f-data-form-title").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Butte Bible Fellowship");
  });

  it("writes what is typed as a new page, and opens its own page", async () => {
    const fetch = vi.fn(async () => ABOUT);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(ContentEditor, { props: { record: null } });
    await wrapper.find("#content-title").setValue("About Us");
    await wrapper.find("#content-slug").setValue("about-us");
    await wrapper.find("#content-description").setValue("Who we are.");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith("/api/content", {
      method: "POST",
      body: {
        slug: "about-us",
        title: "About Us",
        description: "Who we are.",
      },
    });
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/content/6/page"),
    );
  });

  it("saves a page's metadata in place, and says which was saved", async () => {
    const changed = { ...HOME, title: "Welcome" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(ContentEditor, { props: { record: HOME } });
    await wrapper.find("#content-title").setValue("Welcome");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(wrapper.emitted("saved")).toBeTruthy());
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
    expect(fetch).toHaveBeenCalledWith("/api/content/5", {
      method: "PUT",
      body: expect.objectContaining({ title: "Welcome", slug: "index" }),
    });
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(value(wrapper, "content-title")).toBe("Welcome");
  });

  it("shows what is wrong with a draft, by its field, and stays open", async () => {
    const fetch = vi.fn(async () => ABOUT);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(ContentEditor, { props: { record: ABOUT } });
    await wrapper.find("#content-slug").setValue("About Us");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find("#content-slug-error").exists()).toBe(true),
    );
    expect(wrapper.find("#content-slug").attributes("aria-invalid")).toBe(
      "true",
    );
    expect(wrapper.find(".content-editor-error").exists()).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says what went wrong when the save fails, where a reader is told", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const wrapper = mount(ContentEditor, { props: { record: HOME } });
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find(".content-editor-error").exists()).toBe(true),
    );
    const error = wrapper.find(".content-editor-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("The server is away.");
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(wrapper.find(".content-editor-save").text()).toBe("Save");
  });

  it("leaves the save to the page that holds its record: no button of its own, the form handed in", async () => {
    const changed = { ...HOME, title: "Welcome" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, drafts } = mountHeld(ContentEditor, HOME);
    expect(wrapper.find("button.content-editor-save").exists()).toBe(false);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
    expect(drafts.dirty.value).toBe(false);
    expect(drafts.open.value).toBe(false);
    await wrapper.find("#content-title").setValue("Welcome");
    expect(drafts.dirty.value).toBe(true);
    expect(drafts.open.value).toBe(true);
    await drafts.save();
    expect(fetch).toHaveBeenCalledWith("/api/content/5", {
      method: "PUT",
      body: expect.objectContaining({ title: "Welcome" }),
    });
    expect(drafts.dirty.value).toBe(false);
    expect(wrapper.findComponent(ContentEditor).emitted("saved")).toEqual([
      [changed],
    ]);
    expect(value(wrapper, "content-title")).toBe("Welcome");
  });

  it("is put back as it was last saved when the page resets its record", async () => {
    const { wrapper, drafts } = mountHeld(ContentEditor, HOME);
    await wrapper.find("#content-title").setValue("Welcome");
    drafts.reset();
    await wrapper.vm.$nextTick();
    expect(value(wrapper, "content-title")).toBe(HOME.title);
    expect(drafts.dirty.value).toBe(false);
  });

  it("hands what went wrong with a save to the page's bar", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const { wrapper, drafts } = mountHeld(ContentEditor, HOME);
    await wrapper.find("#content-title").setValue("Welcome");
    await drafts.save();
    await wrapper.vm.$nextTick();
    expect(drafts.errors.value).toEqual(["The server is away."]);
    expect(drafts.dirty.value).toBe(true);
    expect(wrapper.find(".content-editor-error").exists()).toBe(false);
  });

  it("keeps its own save for a new page, whatever page it is drawn on", () => {
    const { wrapper, drafts } = mountHeld(ContentEditor, null);
    expect(wrapper.find("button.content-editor-save").text()).toBe("Save");
    expect(drafts.open.value).toBe(false);
  });
});
