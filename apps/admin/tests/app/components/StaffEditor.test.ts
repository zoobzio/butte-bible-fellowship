import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { useRouter } from "#imports";
import { STAFF } from "#test/support/records";
import StaffEditor from "~/components/StaffEditor.vue";

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

describe("StaffEditor", () => {
  it("opens blank for a new member, a draft last in the list, with no delete", () => {
    const wrapper = mount(StaffEditor, { props: { record: null } });
    expect(value(wrapper, "staff-name")).toBe("");
    expect(value(wrapper, "staff-slug")).toBe("");
    expect(value(wrapper, "staff-status")).toBe("draft");
    expect(value(wrapper, "staff-position")).toBe("0");
    expect(wrapper.find(".record-form-delete").exists()).toBe(false);
  });

  it("opens on a member's record, every field filled, with a delete", () => {
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    expect(value(wrapper, "staff-name")).toBe("Jane Doe");
    expect(value(wrapper, "staff-role")).toBe("Elder");
    expect(value(wrapper, "staff-slug")).toBe("jane-doe");
    expect(value(wrapper, "staff-status")).toBe("published");
    expect(value(wrapper, "staff-position")).toBe("2");
    expect(value(wrapper, "staff-email")).toBe("jane@example.com");
    expect(value(wrapper, "staff-summary")).toBe("Has served since 2010.");
    expect(value(wrapper, "staff-bio")).toBe(
      "## Jane\n\nHas served since 2010.",
    );
    expect(wrapper.find(".record-form-delete").exists()).toBe(true);
  });

  it("labels every control", () => {
    const wrapper = mount(StaffEditor, { props: { record: null } });
    for (const label of wrapper.findAll("label")) {
      const id = label.attributes("for");
      expect(id).toBeDefined();
      expect(wrapper.find(`#${id}`).exists(), id).toBe(true);
    }
  });

  it("writes what is typed as a new member", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(StaffEditor, { props: { record: null } });
    await wrapper.find("#staff-name").setValue("John Roe");
    await wrapper.find("#staff-role").setValue("Deacon");
    await wrapper.find("#staff-slug").setValue("john-roe");
    await wrapper.find("#staff-position").setValue("4");
    await wrapper.find("#staff-status").setValue("published");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: {
        slug: "john-roe",
        name: "John Roe",
        role: "Deacon",
        position: 4,
        status: "published",
      },
    });
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/staff"),
    );
  });

  it("shows what is wrong with a draft, and stays open", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    await wrapper.find("#staff-email").setValue("jane");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find(".record-form-error").exists()).toBe(true),
    );
    expect(wrapper.find(".record-form-error").text()).toContain("email:");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("deletes the member once asked", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    await wrapper.find(".record-form-delete").trigger("click");
    await vi.waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/staff/1", { method: "DELETE" }),
    );
  });
});
