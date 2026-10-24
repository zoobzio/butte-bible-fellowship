import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setRoutePath, useHead } from "#imports";
import Login from "~/pages/login.vue";

describe("login page", () => {
  it("signs in with Google, back to the page that was asked for", () => {
    setRoutePath("/login", {}, { redirect: "/events/3" });
    const wrapper = mount(Login);
    expect(wrapper.find("h1").text()).toBe("Butte Bible Fellowship");
    const action = wrapper.find("a.admin-login-action");
    expect(action.text()).toBe("Sign in with Google");
    expect(action.attributes("href")).toBe(
      "/api/auth/login?redirect=%2Fevents%2F3",
    );
    expect(useHead).toHaveBeenCalledWith({ title: "Sign in" });
  });

  it("lands on the admin's home when nothing was asked for", () => {
    setRoutePath("/login");
    expect(mount(Login).find("a").attributes("href")).toBe(
      "/api/auth/login?redirect=%2F",
    );
  });
});
