import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setLocale, setRoutePath } from "#imports";
import { head } from "#test/support/head";
import Login from "~/pages/login.vue";

describe("login page", () => {
  it("signs in with Google, back to the page that was asked for", () => {
    setRoutePath("/login", {}, { redirect: "/events/3" });
    const wrapper = mount(Login);
    expect(wrapper.find("h1").text()).toBe("Butte Bible Fellowship");
    expect(wrapper.find(".admin-login-tag").text()).toBe("Admin");
    const action = wrapper.find("a.admin-login-action");
    expect(action.text()).toBe("Sign in with Google");
    expect(action.attributes("href")).toBe(
      "/api/auth/login?redirect=%2Fevents%2F3",
    );
    expect(head()).toEqual({ title: "Sign in", htmlAttrs: { lang: "en" } });
  });

  it("is read in the reader's language, the document marked with it", () => {
    setLocale("es");
    setRoutePath("/login");
    mount(Login);
    expect(head()).toEqual({ title: "Sign in", htmlAttrs: { lang: "es" } });
  });

  it("lands on the admin's home when nothing was asked for", () => {
    setRoutePath("/login");
    expect(mount(Login).find("a").attributes("href")).toBe(
      "/api/auth/login?redirect=%2F",
    );
  });
});
