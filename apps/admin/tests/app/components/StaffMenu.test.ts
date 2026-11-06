import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

import { Menu } from "#components";
import { useRouter } from "#imports";
import { STAFF } from "#test/support/records";
import StaffMenu from "~/components/StaffMenu.vue";

const mountMenu = () =>
  mount(StaffMenu, { props: { record: STAFF }, attachTo: document.body });

/** Opens the menu from its trigger, as the keyboard does. */
const open = async (wrapper: ReturnType<typeof mountMenu>) => {
  await wrapper.find("button").trigger("keydown", { key: "Enter" });
  await nextTick();
  await nextTick();
  return [...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')];
};

describe("StaffMenu", () => {
  it("is the member's actions, behind one button: delete, for now", async () => {
    const wrapper = mountMenu();
    const trigger = wrapper.find("button");
    expect(trigger.text()).toBe("Actions");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(wrapper.find("svg").exists()).toBe(false);
    expect(wrapper.findComponent(Menu).props("align")).toBe("end");
    const items = await open(wrapper);
    expect(items.map((item) => item.textContent?.trim())).toEqual(["Delete"]);
    // The item's icon is the layer's to draw, from the alias it is given.
    expect(wrapper.findComponent(Menu).props("groups")).toEqual([
      {
        key: "member",
        items: [
          { key: "delete", label: "Delete", icon: "remove", disabled: false },
        ],
      },
    ]);
  });

  it("deletes the member from the menu, once asked", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    const wrapper = mountMenu();
    wrapper
      .findComponent(Menu)
      .vm.$emit("select", { key: "delete", label: "Delete" });
    await flushPromises();
    expect(confirm).toHaveBeenCalledWith(
      "Delete Jane Doe? This cannot be undone.",
    );
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", { method: "DELETE" });
    expect(useRouter().push).toHaveBeenCalledWith("/staff");
  });

  it("says what went wrong when the deletion fails, where a reader is told", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    vi.stubGlobal("confirm", () => true);
    const wrapper = mountMenu();
    wrapper
      .findComponent(Menu)
      .vm.$emit("select", { key: "delete", label: "Delete" });
    await flushPromises();
    const error = wrapper.find(".staff-menu-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("The server is away.");
  });
});
