import type { Component } from "vue";

import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

import { ABOUT_PAGE, CONNECT_PAGE, HOME_PAGE } from "#test/support/records";
import SiteEditor from "~/components/SiteEditor.vue";
import { useDrafts } from "~/composables/drafts";
import { useAboutEditor } from "~/composables/site/about";
import { useConnectEditor } from "~/composables/site/connect";
import { useHomeEditor } from "~/composables/site/home";

/**
 * The panel as the editor of one of the site's pages draws it: over the
 * form that page builds, under the page that saves the whole of it.
 */
const mountPanel = <T>(build: () => T) => {
  let drafts!: ReturnType<typeof useDrafts>;
  const wrapper = mount(
    defineComponent({
      setup() {
        drafts = useDrafts();
        const editor = build();
        return () => h(SiteEditor as Component, { editor });
      },
    }),
    { attachTo: document.body },
  );
  return { wrapper, drafts };
};

const mountHome = () => mountPanel(() => useHomeEditor(HOME_PAGE));

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

describe("SiteEditor", () => {
  it("draws the form it is given under its heading, every field filled", () => {
    const { wrapper } = mountHome();
    const title = wrapper.find("h2.site-editor-title");
    expect(title.text()).toBe("Metadata");
    expect(wrapper.find("form").attributes("aria-labelledby")).toBe(
      title.attributes("id"),
    );
    expect(value(wrapper, "home-title")).toBe("Butte Bible Fellowship");
    expect(value(wrapper, "home-heroLink")).toBe("/about-us");
    expect(wrapper.find("textarea#home-heroDescription").exists()).toBe(true);
  });

  it("is one column of the home page's metadata: what is shown for it, then its hero", () => {
    const { wrapper } = mountHome();
    expect(
      wrapper.findAll(".f-data-form-field-label").map((label) => label.text()),
    ).toEqual([
      "Title",
      "Description",
      "Hero image",
      "Hero heading",
      "Hero text",
      "Button label",
      "Button link",
    ]);
    expect(wrapper.find("#home-slug").exists()).toBe(false);
  });

  it("draws the hero's picture among the fields: a frame with its badges, saying what the page's editor has them say", () => {
    const { wrapper } = mountHome();
    const input = wrapper.find("input#home-heroImage");
    expect(input.attributes()).toMatchObject({
      type: "file",
      accept: "image/jpeg,image/png,image/webp",
    });
    const field = wrapper.find(".image-field");
    expect(
      field.find(".f-image-input-placeholder").attributes("aria-label"),
    ).toBe("No hero image");
    expect(field.find("label.image-field-pick").attributes()).toMatchObject({
      for: "home-heroImage",
      title: "Upload hero image",
    });
    expect(field.find(".image-field-remove").exists()).toBe(false);
  });

  it("writes the heading in a plain text field, its highlight between asterisks", () => {
    const { wrapper } = mountHome();
    const field = wrapper.find("input#home-heroHeading");
    expect(field.attributes("type")).toBe("text");
    expect((field.element as HTMLInputElement).value).toBe(
      "Discover God’s **Love, Grace & Truth**",
    );
    expect(wrapper.find(".f-data-form-rich-text").exists()).toBe(false);
    expect(wrapper.find(".f-data-editor").exists()).toBe(false);
  });

  it("draws whichever page's form it is given: About Us is a title and a description", () => {
    const { wrapper } = mountPanel(() => useAboutEditor(ABOUT_PAGE));
    expect(
      wrapper.findAll(".f-data-form-field label").map((label) => label.text()),
    ).toEqual(["Title", "Description"]);
    expect(value(wrapper, "about-title")).toBe("About Us");
    expect(wrapper.find("#about-heading").exists()).toBe(false);
    expect(wrapper.find(".f-data-form-rich-text").exists()).toBe(false);
  });

  it("draws the connect page's form: its header, then how to reach the church, a hint under the address and the hours", () => {
    const { wrapper } = mountPanel(() => useConnectEditor(CONNECT_PAGE));
    expect(
      wrapper.findAll(".f-data-form-field label").map((label) => label.text()),
    ).toEqual([
      "Title",
      "Description",
      "Address",
      "Phone",
      "Fax",
      "Email",
      "Office hours",
    ]);
    expect(value(wrapper, "connect-address")).toBe(CONNECT_PAGE.address);
    expect(value(wrapper, "connect-hours")).toBe(CONNECT_PAGE.hours);
    expect(wrapper.find("textarea#connect-hours").exists()).toBe(true);
    expect(
      wrapper.findAll(".f-data-form-field-hint").map((hint) => hint.text()),
    ).toEqual([
      "The street address in full. The page’s map is drawn from it.",
      "One line for each line of the page.",
    ]);
  });

  it("labels every control, with no hint under any", () => {
    const { wrapper } = mountHome();
    // The picture has two: its field's, and the badge that picks one.
    const labels = wrapper.findAll("label");
    expect(labels.length).toBe(8);
    for (const label of labels) {
      const id = label.attributes("for");
      expect(id).toBeDefined();
      expect(wrapper.find(`#${id}`).exists(), id).toBe(true);
    }
    expect(wrapper.find(".f-data-form-field-hint").exists()).toBe(false);
  });

  it("saves without the browser's own checks, and keeps neither a title nor a button of its own", () => {
    const { wrapper } = mountHome();
    expect(wrapper.find("form").attributes("novalidate")).toBeDefined();
    expect(wrapper.find(".f-data-form-title").exists()).toBe(false);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
    expect(wrapper.find('button[type="reset"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Save");
  });

  it("hands the form in to the page that saves the whole of it", async () => {
    const changed = { ...HOME_PAGE, title: "Welcome" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, drafts } = mountHome();
    expect(drafts.dirty.value).toBe(false);
    expect(drafts.open.value).toBe(false);
    await wrapper.find("#home-title").setValue("Welcome");
    expect(drafts.dirty.value).toBe(true);
    expect(drafts.open.value).toBe(true);
    await drafts.save();
    expect(fetch).toHaveBeenCalledWith("/api/site/home", {
      method: "PUT",
      body: expect.objectContaining({ title: "Welcome" }),
    });
    expect(drafts.dirty.value).toBe(false);
    expect(value(wrapper, "home-title")).toBe("Welcome");
  });

  it("is put back as it was last saved when the page resets", async () => {
    const { wrapper, drafts } = mountHome();
    await wrapper.find("#home-title").setValue("Welcome");
    drafts.reset();
    await wrapper.vm.$nextTick();
    expect(value(wrapper, "home-title")).toBe(HOME_PAGE.title);
    expect(drafts.dirty.value).toBe(false);
  });

  it("shows what is wrong with a draft by its field, and hands what a save said went wrong to the page's bar", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const { wrapper, drafts } = mountHome();
    await wrapper.find("#home-heroLink").setValue("about-us");
    await drafts.save();
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#home-heroLink-error").exists()).toBe(true);
    expect(wrapper.find("#home-heroLink").attributes("aria-invalid")).toBe(
      "true",
    );
    expect(drafts.errors.value).toEqual([]);

    await wrapper.find("#home-heroLink").setValue("/about-us");
    await drafts.save();
    await wrapper.vm.$nextTick();
    expect(drafts.errors.value).toEqual(["The server is away."]);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });
});
