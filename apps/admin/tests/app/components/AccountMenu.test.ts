import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

import { Menu } from "#components";
import {
  navigateTo,
  setAuthUser,
  setLocale,
  useAuth,
  useNuxtApp,
} from "#imports";
import AccountMenu from "~/components/AccountMenu.vue";

const mountMenu = () => mount(AccountMenu, { attachTo: document.body });

/** Opens the menu from its trigger, as the keyboard does. */
const open = async (wrapper: ReturnType<typeof mountMenu>) => {
  await wrapper.find("button").trigger("keydown", { key: "Enter" });
  await nextTick();
  await nextTick();
  return [...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')];
};

describe("AccountMenu", () => {
  it("shows nobody until someone is signed in", () => {
    expect(mountMenu().find("button").exists()).toBe(false);
  });

  it("opens from a button naming who is signed in, with the user icon", () => {
    setAuthUser({ sub: "u", name: "Pastor Name", email: "pastor@example.com" });
    const trigger = mountMenu().find("button.theme-toggle.account-toggle");
    expect(trigger.text()).toBe("Pastor Name");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
    expect(trigger.find("use").attributes("href")).toBe("#user");
    expect(trigger.find("svg").attributes("aria-hidden")).toBe("true");
  });

  it("holds their email over the way out, at the bar's end", async () => {
    setAuthUser({ sub: "u", name: "Pastor Name", email: "pastor@example.com" });
    const wrapper = mountMenu();
    expect(wrapper.findComponent(Menu).props("align")).toBe("end");
    expect(wrapper.findComponent(Menu).props("groups")).toEqual([
      {
        key: "account",
        label: "pastor@example.com",
        items: [{ key: "sign-out", label: "Sign out", icon: "log-out" }],
      },
    ]);
    const items = await open(wrapper);
    expect(items.map((item) => item.textContent?.trim())).toEqual(["Sign out"]);
  });

  it("names a user Google gave no name by their email alone", () => {
    setAuthUser({ sub: "u", email: "pastor@example.com" });
    const wrapper = mountMenu();
    expect(wrapper.find("button").text()).toBe("pastor@example.com");
    expect(
      (wrapper.findComponent(Menu).props("groups") as { label?: string }[])[0]
        ?.label,
    ).toBeUndefined();
  });

  it("names the menu itself when Google gave neither name nor email", () => {
    setAuthUser({ sub: "u" });
    const wrapper = mountMenu();
    expect(wrapper.find("button").text()).toBe("Account");
    expect(wrapper.findComponent(Menu).props("label")).toBe("Account");
  });

  it("speaks the reader's language", () => {
    setAuthUser({ sub: "u" });
    setLocale("es");
    const { $t } = useNuxtApp();
    const wrapper = mountMenu();
    expect(wrapper.find("button").text()).toBe($t.admin.account.menu());
    expect(
      (
        wrapper.findComponent(Menu).props("groups") as {
          items: { label: string }[];
        }[]
      )[0]?.items[0]?.label,
    ).toBe($t.admin.account.signOut());
  });

  it("signs out to the login page", async () => {
    setAuthUser({ sub: "u", name: "Pastor Name", email: "pastor@example.com" });
    const wrapper = mountMenu();
    wrapper
      .findComponent(Menu)
      .vm.$emit("select", { key: "sign-out", label: "Sign out" });
    await flushPromises();
    expect(useAuth().logout).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(navigateTo).toHaveBeenCalledWith("/login"));
  });
});
