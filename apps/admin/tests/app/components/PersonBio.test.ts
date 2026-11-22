import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import type { Service } from "@zoobzio/editor";

import { Editor } from "#components";
import { mountHeld } from "#test/support/drafts";
import { PERSON } from "#test/support/records";
import PersonBio from "~/components/PersonBio.vue";

const { bio: _, ...BARE } = PERSON;

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

describe("PersonBio", () => {
  it("shows the bio as the page it is, under its heading, with nothing to save", () => {
    const wrapper = mount(PersonBio, { props: { record: PERSON } });
    const title = wrapper.find("h2.person-bio-title");
    expect(title.text()).toBe("Bio");
    expect(content(wrapper).html()).toContain("<p>Has served since 2010.</p>");
    expect(content(wrapper).attributes("aria-labelledby")).toBe(
      title.attributes("id"),
    );
    expect(content(wrapper).attributes("tabindex")).toBe("0");
    expect(
      wrapper.find(".person-bio").attributes("data-editing"),
    ).toBeUndefined();
    expect(
      wrapper.find(".f-data-editor").attributes("data-mounted"),
    ).toBeUndefined();
    expect(wrapper.find(".person-bio-actions").exists()).toBe(false);
  });

  it("tells the bio's outline, its headings given the ids it links to, and again as it is written", async () => {
    const bio = {
      type: "root" as const,
      children: [
        {
          type: "element" as const,
          tagName: "h2",
          properties: {},
          children: [{ type: "text" as const, value: "Dreams" }],
        },
      ],
    };
    const wrapper = mount(PersonBio, {
      props: { record: { ...PERSON, bio } },
    });
    expect(wrapper.emitted("outline")).toEqual([
      [[{ id: "dreams", depth: 2, text: "Dreams" }]],
    ]);
    expect(content(wrapper).find("h2").attributes("id")).toBe("dreams");

    await open(wrapper);
    expect(content(wrapper).find("h2").attributes("id")).toBe("dreams");
    editor(wrapper).run((chain) =>
      chain.setTextSelection({ from: 1, to: 7 }).insertContent("Hopes"),
    );
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("outline")!.at(-1)).toEqual([
      [{ id: "hopes", depth: 2, text: "Hopes" }],
    ]);
    expect(content(wrapper).find("h2").attributes("id")).toBe("hopes");
  });

  it("invites a click where a person has no bio", () => {
    const wrapper = mount(PersonBio, { props: { record: BARE } });
    expect(wrapper.find(".f-data-editor").attributes("data-empty")).toBe(
      "true",
    );
    expect(content(wrapper).attributes("data-placeholder")).toBe(
      "Click to write a bio.",
    );
  });

  it("becomes the editor on a click: its toolbar, and no button of its own, the page's bar saving and resetting it", async () => {
    const { wrapper, drafts } = mountHeld(PersonBio, PERSON);
    expect(drafts.open.value).toBe(false);
    await open(wrapper);
    expect(wrapper.find(".person-bio").attributes("data-editing")).toBe("true");
    expect(wrapper.find(".f-data-editor").attributes("data-mounted")).toBe(
      "true",
    );
    expect(content(wrapper).attributes("contenteditable")).toBe("true");
    expect(wrapper.find('[data-tool="bold"]').exists()).toBe(true);
    expect(wrapper.find(".person-bio-actions").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Save");
    expect(wrapper.text()).not.toContain("Cancel");
    // Nothing is written yet, but the editor is open: there to put back.
    expect(drafts.dirty.value).toBe(false);
    expect(drafts.open.value).toBe(true);
  });

  it("becomes the editor from the keyboard too", async () => {
    const wrapper = mount(PersonBio, {
      props: { record: PERSON },
      attachTo: document.body,
    });
    await content(wrapper).trigger("focus");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".person-bio").attributes("data-editing")).toBe("true");
  });

  it("is saved by the page's bar, on its own request, and reads as a page again", async () => {
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
    const fetch = vi.fn(async () => ({ ...PERSON, bio: written }));
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, drafts } = mountHeld(PersonBio, PERSON);
    await open(wrapper);
    editor(wrapper).run((chain) => chain.selectAll().toggleBold());
    await wrapper.vm.$nextTick();
    expect(drafts.dirty.value).toBe(true);
    await drafts.save();
    await wrapper.vm.$nextTick();
    expect(fetch).toHaveBeenCalledWith("/api/people/1/bio", {
      method: "PATCH",
      body: { bio: written },
    });
    expect(drafts.dirty.value).toBe(false);
    expect(drafts.open.value).toBe(false);
    expect(
      wrapper.find(".person-bio").attributes("data-editing"),
    ).toBeUndefined();
    expect(content(wrapper).attributes("contenteditable")).toBeUndefined();
    expect(content(wrapper).html()).toContain(
      "<p><strong>Has served since 2010.</strong></p>",
    );
  });

  it("drops what was written on a reset, and reads as the bio last saved", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, drafts } = mountHeld(PersonBio, PERSON);
    await open(wrapper);
    editor(wrapper).run((chain) =>
      chain.selectAll().insertContent("A slip of the keys."),
    );
    await wrapper.vm.$nextTick();
    expect(content(wrapper).text()).toBe("A slip of the keys.");
    drafts.reset();
    await wrapper.vm.$nextTick();
    expect(fetch).not.toHaveBeenCalled();
    expect(drafts.open.value).toBe(false);
    expect(
      wrapper.find(".person-bio").attributes("data-editing"),
    ).toBeUndefined();
    expect(content(wrapper).attributes("contenteditable")).toBeUndefined();
    expect(content(wrapper).html()).toContain("<p>Has served since 2010.</p>");

    // The page can be clicked into again.
    await open(wrapper);
    expect(wrapper.find(".person-bio").attributes("data-editing")).toBe("true");
  });

  it("leaves an editor that was only opened on a reset", async () => {
    const { wrapper, drafts } = mountHeld(PersonBio, PERSON);
    await open(wrapper);
    drafts.reset();
    await wrapper.vm.$nextTick();
    expect(drafts.open.value).toBe(false);
    expect(
      wrapper.find(".person-bio").attributes("data-editing"),
    ).toBeUndefined();
  });

  it("hands what went wrong with a save to the page's bar, and stays open", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const { wrapper, drafts } = mountHeld(PersonBio, PERSON);
    await open(wrapper);
    editor(wrapper).run((chain) =>
      chain.selectAll().insertContent("Since 2010."),
    );
    await wrapper.vm.$nextTick();
    await drafts.save();
    await wrapper.vm.$nextTick();
    expect(drafts.errors.value).toEqual(["The server is away."]);
    expect(drafts.dirty.value).toBe(true);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find(".person-bio").attributes("data-editing")).toBe("true");
    expect(content(wrapper).text()).toBe("Since 2010.");
  });
});
