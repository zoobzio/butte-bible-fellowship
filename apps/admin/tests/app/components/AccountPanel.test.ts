import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import {
  navigateTo,
  setAuthUser,
  setLocale,
  useAuth,
  useNuxtApp,
} from "#imports";
import AccountPanel from "~/components/AccountPanel.vue";

const mountPanel = () => mount(AccountPanel, { attachTo: document.body });

describe("AccountPanel", () => {
  it("shows nobody until someone is signed in", () => {
    expect(mountPanel().find(".account-panel").exists()).toBe(false);
  });

  it("names and addresses who is signed in, over the language and appearance controls and the way out", () => {
    setAuthUser({ sub: "u", name: "Pastor Name", email: "pastor@example.com" });
    const panel = mountPanel().find(".account-panel");
    expect(panel.find(".account-identity-name").text()).toBe("Pastor Name");
    expect(panel.find(".account-identity-email").text()).toBe(
      "pastor@example.com",
    );

    const controls = panel.find('[role="group"].account-controls');
    expect(controls.attributes("aria-label")).toBe("Appearance");
    expect(
      controls
        .findAll("button")
        .map((button) => button.attributes("aria-label")),
    ).toEqual([
      "Change language",
      "Switch to dark mode",
      "Choose a theme",
      "Appearance settings",
    ]);
    expect(controls.find(".language-toggle").text()).toBe("English");

    const action = panel.find(".account-action");
    expect(action.text()).toBe("Sign out");
    expect(action.find("use").attributes("href")).toBe("#log-out");
    expect(
      panel
        .find(".account-identity + .account-controls + .account-action")
        .exists(),
    ).toBe(true);
  });

  it("names a user Google gave no name by their email alone", () => {
    setAuthUser({ sub: "u", email: "pastor@example.com" });
    const panel = mountPanel().find(".account-panel");
    expect(panel.find(".account-identity-name").exists()).toBe(false);
    expect(panel.find(".account-identity-email").text()).toBe(
      "pastor@example.com",
    );
  });

  it("opens nothing of its own: the appearance settings open from their control", async () => {
    setAuthUser({ sub: "u", name: "Pastor Name" });
    const panel = mountPanel().find(".account-panel");
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    await panel.find('[aria-label="Appearance settings"]').trigger("click");
    await vi.waitFor(() =>
      expect(document.body.querySelector(".theme-settings")).not.toBeNull(),
    );
  });

  it("speaks the reader's language, its controls among the words", () => {
    setAuthUser({ sub: "u", name: "Pastor Name" });
    setLocale("es");
    const { $t } = useNuxtApp();
    const panel = mountPanel().find(".account-panel");
    const controls = panel.find(".account-controls");
    expect(controls.attributes("aria-label")).toBe(
      $t.admin.account.appearance(),
    );
    expect(controls.find(".language-toggle").text()).toBe("Español");
    const labels = controls
      .findAll("button")
      .map((button) => button.attributes("aria-label"));
    expect(labels).toEqual([
      $t.language.open(),
      $t.appearance.scheme({ mode: "dark" }),
      $t.appearance.open(),
      $t.appearance.settings(),
    ]);
    expect(labels).not.toContain("Switch to dark mode");
    expect(panel.find(".account-action").text()).toBe(
      $t.admin.account.signOut(),
    );
  });

  it("signs out to the login page", async () => {
    setAuthUser({ sub: "u", name: "Pastor Name", email: "pastor@example.com" });
    await mountPanel().find(".account-action").trigger("click");
    await nextTick();
    expect(useAuth().logout).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(navigateTo).toHaveBeenCalledWith("/login"));
  });
});
