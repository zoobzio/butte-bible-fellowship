import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import type { Service } from "@zoobzio/editor";

import { Editor } from "#components";
import { HOME } from "#test/support/records";
import ContentBody from "~/components/ContentBody.vue";

const { body: _, ...BARE } = HOME;

const content = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find(".f-data-editor-content");

/** The bio's editor, to write in as the keys and the toolbar do. */
const editor = (wrapper: ReturnType<typeof mount>): Service<string, string> =>
  wrapper.findComponent(Editor).props("service");

/** Clicks into the bio, as a reader does to edit it. */
const open = async (wrapper: ReturnType<typeof mount>) => {
  await content(wrapper).trigger("pointerdown");
  await wrapper.vm.$nextTick();
};

describe("ContentBody", () => {
  it("shows what is written as the page it is, under its heading, with nothing to save", () => {
    const wrapper = mount(ContentBody, { props: { record: HOME } });
    const title = wrapper.find("h2.content-body-title");
    expect(title.text()).toBe("Content");
    expect(content(wrapper).html()).toContain("<p>Has served since 2010.</p>");
    expect(content(wrapper).attributes("aria-labelledby")).toBe(
      title.attributes("id"),
    );
    expect(content(wrapper).attributes("tabindex")).toBe("0");
    expect(
      wrapper.find(".content-body").attributes("data-editing"),
    ).toBeUndefined();
    expect(
      wrapper.find(".f-data-editor").attributes("data-mounted"),
    ).toBeUndefined();
    expect(wrapper.find(".content-body-actions").exists()).toBe(false);
  });

  it("invites a click where nothing is written on a page", () => {
    const wrapper = mount(ContentBody, { props: { record: BARE } });
    expect(wrapper.find(".f-data-editor").attributes("data-empty")).toBe(
      "true",
    );
    expect(content(wrapper).attributes("data-placeholder")).toBe(
      "Click to write the page.",
    );
  });

  it("becomes the editor on a click: its toolbar, a save with nothing yet to save, and a cancel", async () => {
    const wrapper = mount(ContentBody, {
      props: { record: HOME },
      attachTo: document.body,
    });
    await open(wrapper);
    expect(wrapper.find(".content-body").attributes("data-editing")).toBe(
      "true",
    );
    expect(wrapper.find(".f-data-editor").attributes("data-mounted")).toBe(
      "true",
    );
    expect(content(wrapper).attributes("contenteditable")).toBe("true");
    expect(wrapper.find('[data-tool="bold"]').exists()).toBe(true);
    const save = wrapper.find(".content-body-save");
    expect(save.text()).toBe("Save");
    expect(save.attributes("disabled")).toBeDefined();
    expect(wrapper.find(".content-body-cancel").text()).toBe("Cancel");
  });

  it("becomes the editor from the keyboard too", async () => {
    const wrapper = mount(ContentBody, {
      props: { record: HOME },
      attachTo: document.body,
    });
    await content(wrapper).trigger("focus");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".content-body").attributes("data-editing")).toBe(
      "true",
    );
  });

  it("saves what was written on its own, and reads as a page again", async () => {
    const written = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "strong",
              properties: {},
              children: [{ type: "text", value: "Has served since 2010." }],
            },
          ],
        },
      ],
    };
    const fetch = vi.fn(async () => ({ ...HOME, body: written }));
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(ContentBody, {
      props: { record: HOME },
      attachTo: document.body,
    });
    await open(wrapper);
    editor(wrapper).run((chain) => chain.selectAll().toggleBold());
    await wrapper.vm.$nextTick();
    const save = wrapper.find(".content-body-save");
    expect(save.attributes("disabled")).toBeUndefined();
    await save.trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledWith("/api/content/5/body", {
      method: "PATCH",
      body: { body: written },
    });
    expect(
      wrapper.find(".content-body").attributes("data-editing"),
    ).toBeUndefined();
    expect(wrapper.find(".content-body-actions").exists()).toBe(false);
    expect(content(wrapper).attributes("contenteditable")).toBeUndefined();
    expect(content(wrapper).html()).toContain(
      "<p><strong>Has served since 2010.</strong></p>",
    );
  });

  it("drops what was written on a cancel, and reads as what was last saved", async () => {
    const fetch = vi.fn(async () => HOME);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(ContentBody, {
      props: { record: HOME },
      attachTo: document.body,
    });
    await open(wrapper);
    editor(wrapper).run((chain) =>
      chain.selectAll().insertContent("A slip of the keys."),
    );
    await wrapper.vm.$nextTick();
    expect(content(wrapper).text()).toBe("A slip of the keys.");
    await wrapper.find(".content-body-cancel").trigger("click");
    await wrapper.vm.$nextTick();
    expect(fetch).not.toHaveBeenCalled();
    expect(
      wrapper.find(".content-body").attributes("data-editing"),
    ).toBeUndefined();
    expect(content(wrapper).attributes("contenteditable")).toBeUndefined();
    expect(content(wrapper).html()).toContain("<p>Has served since 2010.</p>");

    // The page can be clicked into again.
    await open(wrapper);
    expect(wrapper.find(".content-body").attributes("data-editing")).toBe(
      "true",
    );
  });

  it("says what went wrong when the save fails, where a reader is told, and stays open", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const wrapper = mount(ContentBody, {
      props: { record: HOME },
      attachTo: document.body,
    });
    await open(wrapper);
    editor(wrapper).run((chain) =>
      chain.selectAll().insertContent("Since 2010."),
    );
    await wrapper.vm.$nextTick();
    await wrapper.find(".content-body-save").trigger("click");
    await flushPromises();
    const error = wrapper.find(".content-body-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("The server is away.");
    expect(wrapper.find(".content-body").attributes("data-editing")).toBe(
      "true",
    );
    expect(content(wrapper).text()).toBe("Since 2010.");
  });
});
