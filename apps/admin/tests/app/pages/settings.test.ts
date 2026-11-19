import type { Component } from "vue";

import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, shallowRef, Suspense } from "vue";

import { NuxtPage } from "#components";
import { routeGuards, setRoutePath } from "#imports";
import AppearanceEditor from "~/components/AppearanceEditor.vue";
import LeaveDialog from "~/components/LeaveDialog.vue";
import PageHeader from "~/components/PageHeader.vue";
import SaveBar from "~/components/SaveBar.vue";
import SectionMenu from "~/components/SectionMenu.vue";
import Settings from "~/pages/settings.vue";
import Appearance from "~/pages/settings/appearance.vue";
import Modifiers from "~/pages/settings/appearance/modifiers.vue";
import Palette from "~/pages/settings/appearance/palette.vue";
import { head } from "#test/support/head";
import { APPEARANCE, APPEARANCE_SET } from "#test/support/records";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

describe("settings page", () => {
  it("heads the settings, with no way back and nothing to add", () => {
    setRoutePath("/settings/appearance");
    const wrapper = mount(Settings);
    expect(wrapper.findComponent(PageHeader).props()).toMatchObject({
      title: "Settings",
      description: "How the site looks.",
      back: undefined,
      action: undefined,
    });
    expect(wrapper.find(".page-header-actions").exists()).toBe(false);
    expect(head()).toEqual({ title: "Settings" });
  });

  it("offers one tab, a link to a page of its own: the site's own pages are not among the settings", () => {
    setRoutePath("/settings/appearance");
    const wrapper = mount(Settings);
    expect(wrapper.findComponent(PageHeader).props("tabs")).toEqual([
      { label: "Appearance", to: "/settings/appearance" },
    ]);
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(
      tabs.map((tab) => [
        tab.element.tagName,
        tab.text(),
        tab.attributes("href"),
      ]),
    ).toEqual([["A", "Appearance", "/settings/appearance"]]);
  });

  it("lights the tab of the page being read", () => {
    const lit = (path: string) => {
      setRoutePath(path);
      return mount(Settings)
        .findAll(".page-header-tabs .f-tabs-trigger")
        .filter((tab) => tab.attributes("data-state") === "active")
        .map((tab) => tab.text());
    };
    expect(lit("/settings/appearance")).toEqual(["Appearance"]);
    expect(lit("/settings")).toEqual([]);
  });

  it("draws the tab's page under the header, and hands it nothing", () => {
    setRoutePath("/settings/appearance");
    const wrapper = mount(Settings);
    expect(wrapper.find("header.page-header + .nuxt-page").exists()).toBe(true);
    expect(wrapper.findComponent(NuxtPage).props("record")).toBeUndefined();
  });
});

/** The tab with one of its sections drawn under it, as the router would. */
const mountSection = async (section: Component) => {
  const wrapper = mount(
    defineComponent({
      render: () => h(Suspense, null, { default: () => h(Appearance) }),
    }),
    { global: { stubs: { NuxtPage: section } } },
  );
  await flushPromises();
  return wrapper;
};

const unsaved = (wrapper: ReturnType<typeof mount>) =>
  wrapper
    .findAll(".section-menu-link")
    .map((link) => [link.text(), link.find(".section-menu-status").exists()]);

/** The same tab, another of its sections read: its page under it changed. */
const mountSections = async () => {
  const section = shallowRef<Component>(Palette);
  const wrapper = mount(
    defineComponent({
      render: () => h(Suspense, null, { default: () => h(Appearance) }),
    }),
    {
      global: {
        stubs: {
          NuxtPage: defineComponent({ render: () => h(section.value) }),
        },
      },
    },
  );
  await flushPromises();
  const read = async (next: Component, path: string) => {
    setRoutePath(path);
    section.value = next;
    await flushPromises();
  };
  return { wrapper, read };
};

describe("appearance tab", () => {
  it("reads how the site looks and lists its sections beside the one being read, over the bar that saves it", async () => {
    setRoutePath("/settings/appearance/palette");
    const fetch = vi.fn(async () => APPEARANCE_SET);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, error } = await mountSuspended(Appearance);
    expect(error).toBeUndefined();
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      "/api/settings/appearance",
      {},
    );
    expect(wrapper.findComponent(SectionMenu).props()).toEqual({
      label: "Appearance settings",
      sections: [
        {
          label: "Color palette",
          to: "/settings/appearance/palette",
          current: true,
          unsaved: false,
          invalid: false,
        },
        {
          label: "Modifiers",
          to: "/settings/appearance/modifiers",
          current: false,
          unsaved: false,
          invalid: false,
        },
      ],
    });
    expect(
      wrapper
        .find(
          ".settings-appearance > nav.section-menu + .nuxt-page + .save-bar",
        )
        .exists(),
    ).toBe(true);
    expect(wrapper.findComponent(SaveBar).props()).toMatchObject({
      dirty: false,
      saving: false,
    });
  });

  it("draws the section being read under it: the palette's colors, or the modifiers", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => APPEARANCE_SET),
    );
    setRoutePath("/settings/appearance/palette");
    const palette = await mountSection(Palette);
    expect(
      palette.findComponent(AppearanceEditor).props("editor").form.id,
    ).toBe("appearance-palette");
    expect(
      (palette.find("#appearance-palette-primary").element as HTMLInputElement)
        .value,
    ).toBe("#7c3aed");
    expect(palette.find("#appearance-modifiers-color").exists()).toBe(false);
    palette.unmount();
    setRoutePath("/settings/appearance/modifiers");
    const modifiers = await mountSection(Modifiers);
    expect(
      modifiers.findComponent(AppearanceEditor).props("editor").form.id,
    ).toBe("appearance-modifiers");
    expect(modifiers.find("#appearance-modifiers-color").exists()).toBe(true);
    expect(modifiers.find("#appearance-palette-primary").exists()).toBe(false);
  });

  it("keeps what is changed in one section as another is read, each marked, and saves them together", async () => {
    setRoutePath("/settings/appearance/palette");
    const kept = [
      APPEARANCE,
      { ...APPEARANCE, seeds: { secondary: "#0ea5e9" } },
      { ...APPEARANCE, seeds: { secondary: "#0ea5e9" }, input: { text: "lg" } },
    ];
    const fetch = vi.fn(async () => kept.shift());
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, read } = await mountSections();
    const bar = wrapper.findComponent(SaveBar);
    const clean = [
      ["Color palette", false],
      ["Modifiers", false],
    ];
    expect(bar.props()).toMatchObject({ dirty: false, saving: false });
    expect(unsaved(wrapper)).toEqual(clean);
    await wrapper.find("#appearance-palette-secondary").setValue("#0ea5e9");
    expect(unsaved(wrapper)).toEqual([
      ["Color palette", true],
      ["Modifiers", false],
    ]);
    await read(Modifiers, "/settings/appearance/modifiers");
    expect(wrapper.find("#appearance-palette-secondary").exists()).toBe(false);
    expect(bar.props("dirty")).toBe(true);
    wrapper
      .findComponent(AppearanceEditor)
      .props("editor")
      .form.set("text", "lg");
    await flushPromises();
    expect(unsaved(wrapper)).toEqual([
      ["Color palette", true],
      ["Modifiers", true],
    ]);
    await read(Palette, "/settings/appearance/palette");
    expect(
      (
        wrapper.find("#appearance-palette-secondary")
          .element as HTMLInputElement
      ).value,
    ).toBe("#0ea5e9");
    await wrapper.find(".save-bar-save").trigger("click");
    await flushPromises();
    expect(fetch.mock.calls.slice(1)).toEqual([
      [
        "/api/settings/appearance",
        { method: "PUT", body: { seeds: { secondary: "#0ea5e9" }, input: {} } },
      ],
      [
        "/api/settings/appearance",
        {
          method: "PUT",
          body: { seeds: { secondary: "#0ea5e9" }, input: { text: "lg" } },
        },
      ],
    ]);
    expect(bar.props("dirty")).toBe(false);
    expect(unsaved(wrapper)).toEqual(clean);
  });

  it("puts every section back from the bar, the one being read and the other", async () => {
    setRoutePath("/settings/appearance/palette");
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => APPEARANCE),
    );
    const { wrapper, read } = await mountSections();
    await wrapper.find("#appearance-palette-secondary").setValue("#000000");
    await read(Modifiers, "/settings/appearance/modifiers");
    expect(unsaved(wrapper)[0]).toEqual(["Color palette", true]);
    await wrapper.find(".save-bar-reset").trigger("click");
    await flushPromises();
    expect(unsaved(wrapper)[0]).toEqual(["Color palette", false]);
    expect(wrapper.findComponent(SaveBar).props("dirty")).toBe(false);
  });

  it("marks a section a save found something wrong in, and writes nothing of it", async () => {
    setRoutePath("/settings/appearance/palette");
    const fetch = vi.fn(async () => APPEARANCE);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, read } = await mountSections();
    await wrapper.find("#appearance-palette-primary").setValue("purple");
    await read(Modifiers, "/settings/appearance/modifiers");
    await wrapper.find(".save-bar-save").trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(
      wrapper
        .findAll(".section-menu-status")
        .map((mark) => mark.attributes("data-status")),
    ).toEqual(["invalid"]);
  });

  it("asks in a window before the settings are left with changes, and not before, nor between sections", async () => {
    setRoutePath("/settings/appearance/palette");
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => APPEARANCE),
    );
    const { wrapper, read } = await mountSections();
    const dialog = wrapper.findComponent(LeaveDialog);
    const [leave] = routeGuards().leave;
    expect(leave!()).toBe(true);
    expect(dialog.props("open")).toBe(false);
    await wrapper.find("#appearance-palette-primary").setValue("#7c3aed");
    await read(Modifiers, "/settings/appearance/modifiers");
    expect(dialog.props("open")).toBe(false);
    expect(routeGuards().leave).toHaveLength(1);
    const stayed = leave!();
    await flushPromises();
    expect(dialog.props("open")).toBe(true);
    dialog.vm.$emit("stay");
    await expect(stayed).resolves.toBe(false);
    await flushPromises();
    expect(dialog.props("open")).toBe(false);
    const left = leave!();
    await flushPromises();
    expect(dialog.props("open")).toBe(true);
    dialog.vm.$emit("leave");
    await expect(left).resolves.toBe(true);
  });

  it("throws a 404 should its row be missing", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw Object.assign(new Error("404"), { status: 404 });
      }),
    );
    const { wrapper, error } = await mountSuspended(Appearance);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "The appearance settings could not be found.",
    });
    expect(wrapper.findComponent(SectionMenu).exists()).toBe(false);
  });
});
