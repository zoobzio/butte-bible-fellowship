import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { useRouter } from "#imports";
import { STAFF } from "#test/support/records";
import StaffEditor from "~/components/StaffEditor.vue";

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

describe("StaffEditor", () => {
  it("opens blank for a new member, a draft with no role, with no delete", () => {
    const wrapper = mount(StaffEditor, { props: { record: null } });
    expect(value(wrapper, "staff-name")).toBe("");
    expect(value(wrapper, "staff-role")).toBe("");
    expect(value(wrapper, "staff-status")).toBe("draft");
    expect(wrapper.find("#staff-bio").text()).toBe("");
    expect(wrapper.find(".record-form-delete").exists()).toBe(false);
  });

  it("opens on a member's record, every field filled, with a delete", () => {
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    expect(value(wrapper, "staff-name")).toBe("Jane Doe");
    expect(value(wrapper, "staff-role")).toBe("elder");
    expect(value(wrapper, "staff-status")).toBe("published");
    expect(value(wrapper, "staff-email")).toBe("jane@example.com");
    expect(value(wrapper, "staff-summary")).toBe("Has served since 2010.");
    expect(wrapper.find("#staff-bio").html()).toContain(
      "<p>Has served since 2010.</p>",
    );
    expect(wrapper.find(".record-form-delete").exists()).toBe(true);
  });

  it("offers each role by name, and the bio as rich text", () => {
    const wrapper = mount(StaffEditor, { props: { record: null } });
    expect(
      wrapper
        .findAll("#staff-role option")
        .filter((option) => option.attributes("value") !== "")
        .map((option) => [option.attributes("value"), option.text()]),
    ).toEqual([
      ["pastor", "Pastor"],
      ["elder", "Elder"],
      ["staff", "Staff"],
    ]);
    const editor = wrapper.find(".staff-bio .f-data-editor");
    expect(editor.exists()).toBe(true);
    expect(editor.find('[data-tool="bold"]').exists()).toBe(true);
    expect(wrapper.find("#staff-bio").attributes("aria-labelledby")).toBe(
      "staff-bio-label",
    );
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
    await wrapper.find("#staff-role").setValue("staff");
    await wrapper.find("#staff-status").setValue("published");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: { name: "John Roe", role: "staff", status: "published" },
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
