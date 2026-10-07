import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { OutlineEntry } from "~/types/outline";

import { useOutlineSpy } from "~/composables/outline";
import { withSetup } from "#test/support/mount";
import { stubPage } from "#test/support/page";

const ENTRIES: OutlineEntry[] = [
  { id: "our-vision", depth: 1, text: "Our Vision" },
  { id: "dreams", depth: 2, text: "Dreams" },
  { id: "core-beliefs", depth: 1, text: "Core Beliefs" },
];

/** Where each heading sits in the page, from its top. */
const OFFSETS: Record<string, number> = {
  "our-vision": 200,
  dreams: 600,
  "core-beliefs": 2400,
};

/**
 * Puts the headings, and a 100px site header, in the document: each heading
 * reports its place in the viewport from the page's scroll.
 */
const layOut = (page: { scrollY: number }, ids = Object.keys(OFFSETS)) => {
  const header = document.createElement("header");
  header.className = "site-header";
  Object.defineProperty(header, "offsetHeight", { get: () => 100 });
  document.body.append(header);

  for (const id of ids) {
    const heading = document.createElement("h2");
    heading.id = id;
    heading.getBoundingClientRect = () =>
      ({ top: OFFSETS[id]! - page.scrollY }) as DOMRect;
    document.body.append(heading);
  }
};

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("useOutlineSpy", () => {
  it("reads the sections on screen on mount", () => {
    const { page } = stubPage();
    layOut(page);
    const { result } = withSetup(() => useOutlineSpy(ENTRIES));
    expect(result.value).toEqual(["our-vision", "dreams"]);
  });

  it("follows scroll on the next frame", async () => {
    const { page, frame, scroll } = stubPage();
    layOut(page);
    const { result } = withSetup(() => useOutlineSpy(ENTRIES));

    scroll(1000);
    expect(result.value).toEqual(["our-vision", "dreams"]);

    await frame();
    expect(result.value).toEqual(["dreams"]);
  });

  it("keeps a section while what it heads is on screen, its heading gone", async () => {
    const { page, frame, scroll } = stubPage();
    layOut(page);
    const { result } = withSetup(() => useOutlineSpy(ENTRIES));

    scroll(1700);
    await frame();
    expect(result.value).toEqual(["dreams", "core-beliefs"]);
  });

  it("does not count what the site's header covers", async () => {
    const { page, frame, scroll } = stubPage();
    layOut(page);
    const { result } = withSetup(() => useOutlineSpy(ENTRIES));

    // "Dreams" starts 50px under the viewport's top: behind the header.
    scroll(550);
    await frame();
    expect(result.value).toEqual(["dreams"]);
  });

  it("follows a resize", async () => {
    const { page, frame, resize } = stubPage({ innerHeight: 500 });
    layOut(page);
    const { result } = withSetup(() => useOutlineSpy(ENTRIES));
    expect(result.value).toEqual(["our-vision"]);

    resize({ innerHeight: 800 });
    await frame();
    expect(result.value).toEqual(["our-vision", "dreams"]);
  });

  it("keeps the same list while the same sections are on screen", async () => {
    const { page, frame, scroll } = stubPage();
    layOut(page);
    const { result } = withSetup(() => useOutlineSpy(ENTRIES));
    const before = result.value;

    scroll(50);
    await frame();
    expect(result.value).toBe(before);
  });

  it("passes over an entry whose heading is not in the document", () => {
    const { page } = stubPage();
    layOut(page, ["our-vision", "core-beliefs"]);
    const { result } = withSetup(() => useOutlineSpy(ENTRIES));
    expect(result.value).toEqual(["our-vision"]);
  });

  it("reads again when the outline changes", async () => {
    const { page, frame } = stubPage();
    layOut(page);
    const entries = ref(ENTRIES.slice(0, 1));
    const { result } = withSetup(() => useOutlineSpy(entries));
    expect(result.value).toEqual(["our-vision"]);

    entries.value = ENTRIES;
    await frame();
    await frame();
    expect(result.value).toEqual(["our-vision", "dreams"]);
  });

  it("stops following the window on unmount", async () => {
    const { page, frame, scroll, pending } = stubPage();
    layOut(page);
    const { wrapper } = withSetup(() => useOutlineSpy(ENTRIES));

    wrapper.unmount();
    scroll(1000);
    expect(pending()).toBe(0);
    await frame();
  });
});
