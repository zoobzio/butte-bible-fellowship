import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

import type { OutlineEntry } from "~/types/outline";

import { useNuxtApp } from "#imports";
import TableOfContents from "~/components/TableOfContents.vue";
import { stubPage } from "#test/support/page";

const ENTRIES: OutlineEntry[] = [
  { id: "our-vision", depth: 1, text: "Our Vision" },
  { id: "dreams", depth: 2, text: "Dreams" },
  { id: "god-the-father", depth: 3, text: "God the Father" },
];

const { $t } = useNuxtApp();

const mountContents = (entries = ENTRIES) =>
  mount(TableOfContents, { props: { entries } });

/** Where each heading sits in the page, from its top. */
const OFFSETS: Record<string, number> = {
  "our-vision": 200,
  dreams: 600,
  "god-the-father": 2400,
};

/** Puts the entries' headings in the document, placed by the page's scroll. */
const layOut = (page: { scrollY: number }) => {
  for (const [id, offset] of Object.entries(OFFSETS)) {
    const heading = document.createElement("h2");
    heading.id = id;
    heading.getBoundingClientRect = () =>
      ({ top: offset - page.scrollY }) as DOMRect;
    document.body.append(heading);
  }
};

/** The texts of the entries marked as on screen. */
const marked = (wrapper: ReturnType<typeof mountContents>) =>
  wrapper.findAll("li.toc-item[data-active]").map((item) => item.text());

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("TableOfContents", () => {
  it("is a navigation landmark named for what it lists", () => {
    const nav = mountContents().find("nav.toc");
    expect(nav.attributes("aria-label")).toBe($t.page.contents());
    expect(nav.find(".toc-title").text()).toBe($t.page.contents());
  });

  it("links each entry to its heading, in order, marked with its level", () => {
    expect(
      mountContents()
        .findAll("li.toc-item")
        .map((item) => ({
          depth: item.attributes("data-depth"),
          text: item.find("a.toc-link").text(),
          to: item.find("a.toc-link").attributes("href"),
        })),
    ).toEqual(
      ENTRIES.map(({ id, depth, text }) => ({
        depth: String(depth),
        text,
        to: `#${id}`,
      })),
    );
  });

  it("renders nothing for a page with no headings", () => {
    expect(mountContents([]).find("nav").exists()).toBe(false);
  });

  it("marks the entries whose sections are on screen", async () => {
    const { page } = stubPage();
    layOut(page);
    const wrapper = mountContents();
    await nextTick();
    expect(marked(wrapper)).toEqual(["Our Vision", "Dreams"]);
    expect(wrapper.find(".toc-marker").attributes("data-active")).toBe("");
  });

  it("moves the mark as the page scrolls", async () => {
    const { page, frame, scroll } = stubPage();
    layOut(page);
    const wrapper = mountContents();

    scroll(1700);
    await frame();
    expect(marked(wrapper)).toEqual(["Dreams", "God the Father"]);
  });

  it("runs the marker from the first marked entry to the last", async () => {
    const { page, frame, scroll } = stubPage();
    layOut(page);
    const wrapper = mountContents();
    const items = wrapper.findAll<HTMLElement>("li.toc-item");
    items.forEach((item, index) => {
      Object.defineProperty(item.element, "offsetTop", {
        get: () => index * 30,
      });
      Object.defineProperty(item.element, "offsetHeight", { get: () => 20 });
    });

    scroll(1700);
    await frame();
    const marker = wrapper.find<HTMLElement>(".toc-marker").element;
    expect(marker.style.transform).toBe("translateY(30px)");
    expect(marker.style.height).toBe("50px");
  });

  it("marks nothing, and hides the marker, above the first heading", () => {
    const { page } = stubPage({ innerHeight: 100 });
    layOut(page);
    const wrapper = mountContents();
    expect(marked(wrapper)).toEqual([]);
    const marker = wrapper.find(".toc-marker");
    expect(marker.attributes("data-active")).toBeUndefined();
    expect(marker.attributes("aria-hidden")).toBe("true");
  });
});
