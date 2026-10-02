import type { MenuGroup } from "~/components/Menu.vue";

import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import Menu from "~/components/Menu.vue";

const GROUPS: MenuGroup[] = [
  {
    key: "pages",
    label: "Pages",
    items: [
      { label: "Home", to: "/" },
      { label: "Visit", to: "/visit" },
    ],
  },
  {
    key: "actions",
    items: [{ label: "Sign out" }, { label: "Archive", disabled: true }],
  },
];

// The menu content is portalled to the body, so it is queried from there.
const mountMenu = async (options: Parameters<typeof mount<typeof Menu>>[1] = {}) => {
  const wrapper = mount(Menu, {
    attachTo: document.body,
    ...options,
    props: { groups: GROUPS, ...options.props },
  });
  await nextTick();
  await nextTick();
  return wrapper;
};

const items = () =>
  [...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')];

describe("Menu", () => {
  it("renders a button with the label as its trigger", async () => {
    const wrapper = await mountMenu({ props: { groups: GROUPS, label: "More" } });
    const trigger = wrapper.find("button");
    expect(trigger.text()).toBe("More");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
  });

  it("uses the default slot as the trigger instead", async () => {
    const wrapper = await mountMenu({
      slots: { default: '<button class="custom">Open</button>' },
    });
    const trigger = wrapper.find("button.custom");
    expect(trigger.exists()).toBe(true);
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
  });

  it("is closed until opened", async () => {
    await mountMenu();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();
  });

  it("lists every item of every group when open", async () => {
    await mountMenu({ props: { groups: GROUPS, open: true } });
    expect(items().map((item) => item.textContent)).toEqual([
      "Home",
      "Visit",
      "Sign out",
      "Archive",
    ]);
  });

  it("labels groups that have a label and separates groups", async () => {
    await mountMenu({ props: { groups: GROUPS, open: true } });
    const labels = [...document.body.querySelectorAll(".menu-label")];
    expect(labels.map((label) => label.textContent)).toEqual(["Pages"]);
    expect(document.body.querySelectorAll(".menu-separator")).toHaveLength(1);
  });

  it("renders items with a destination as links and the rest as plain items", async () => {
    await mountMenu({ props: { groups: GROUPS, open: true } });
    expect(
      items().map((item) => [item.tagName, item.getAttribute("href")]),
    ).toEqual([
      ["A", "/"],
      ["A", "/visit"],
      ["DIV", null],
      ["DIV", null],
    ]);
    expect(items().every((item) => item.classList.contains("menu-item"))).toBe(
      true,
    );
  });

  it("emits the selected item", async () => {
    const wrapper = await mountMenu({ props: { groups: GROUPS, open: true } });

    items()[2]!.click();
    await nextTick();

    expect(wrapper.emitted("select")).toEqual([[{ label: "Sign out" }]]);
  });

  it("closes after a selection", async () => {
    const wrapper = await mountMenu({ props: { groups: GROUPS, open: true } });

    items()[0]!.click();
    await nextTick();
    await nextTick();

    expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
  });

  it("does not select a disabled item", async () => {
    const wrapper = await mountMenu({ props: { groups: GROUPS, open: true } });
    const archive = items()[3]!;
    expect(archive.hasAttribute("data-disabled")).toBe(true);

    archive.click();
    await nextTick();
    expect(wrapper.emitted("select")).toBeUndefined();
  });
});
