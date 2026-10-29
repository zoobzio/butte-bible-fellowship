import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { useRouter } from "#imports";
import { STAFF } from "#test/support/records";
import Select from "@zoobzio/vue/components/select.vue";
import StaffEditor from "~/components/StaffEditor.vue";

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

const select = (wrapper: ReturnType<typeof mount>, id: string) =>
  wrapper
    .findAllComponents(Select)
    .find((control) => control.find(`#${id}`).exists())!;

const choose = (wrapper: ReturnType<typeof mount>, id: string, value: string) =>
  select(wrapper, id).vm.$emit("update:modelValue", { value, label: value });

describe("StaffEditor", () => {
  it("opens blank for a new member, a draft with no role, with no delete", () => {
    const wrapper = mount(StaffEditor, { props: { record: null } });
    expect(value(wrapper, "staff-name")).toBe("");
    expect(wrapper.find("#staff-role").text()).toBe("");
    expect(wrapper.find("#staff-status").text()).toBe("Draft");
    expect(wrapper.find("#staff-bio").text()).toBe("");
    expect(wrapper.find(".staff-editor-delete").exists()).toBe(false);
  });

  it("opens on a member's record, every field filled, with a delete", () => {
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    expect(value(wrapper, "staff-name")).toBe("Jane Doe");
    expect(wrapper.find("#staff-role").text()).toBe("Elder");
    expect(wrapper.find("#staff-status").text()).toBe("Published");
    expect(value(wrapper, "staff-email")).toBe("jane@example.com");
    expect(value(wrapper, "staff-summary")).toBe("Has served since 2010.");
    expect(wrapper.find("#staff-bio").html()).toContain(
      "<p>Has served since 2010.</p>",
    );
    expect(wrapper.find(".staff-editor-delete").exists()).toBe(true);
  });

  it("offers each role by name, and the bio as rich text", () => {
    const wrapper = mount(StaffEditor, { props: { record: null } });
    expect(select(wrapper, "staff-role").props("options")).toEqual([
      { value: "pastor", label: "Pastor" },
      { value: "elder", label: "Elder" },
      { value: "staff", label: "Staff" },
    ]);
    const editor = wrapper.find(".f-data-editor");
    expect(editor.exists()).toBe(true);
    expect(editor.find('[data-tool="bold"]').exists()).toBe(true);
    expect(wrapper.find("#staff-bio").attributes("aria-labelledby")).toBe(
      "staff-bio-label",
    );
  });

  it("labels every control", () => {
    const wrapper = mount(StaffEditor, { props: { record: null } });
    const labels = wrapper.findAll("label");
    expect(labels.length).toBe(8);
    for (const label of labels) {
      const id = label.attributes("for");
      expect(id).toBeDefined();
      expect(wrapper.find(`#${id}`).exists(), id).toBe(true);
    }
  });

  it("saves without the browser's own checks, and leaves the form's title to the page", () => {
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    expect(wrapper.find("form").attributes("novalidate")).toBeDefined();
    expect(wrapper.find(".f-data-form-title").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Jane Doe");
  });

  it("writes what is typed as a new member", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(StaffEditor, { props: { record: null } });
    await wrapper.find("#staff-name").setValue("John Roe");
    choose(wrapper, "staff-role", "staff");
    choose(wrapper, "staff-status", "published");
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

  it("shows what is wrong with a draft, by its field, and stays open", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    await wrapper.find("#staff-email").setValue("jane");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find("#staff-email-error").exists()).toBe(true),
    );
    expect(wrapper.find("#staff-email").attributes("aria-invalid")).toBe(
      "true",
    );
    expect(wrapper.find("#staff-email").attributes("aria-describedby")).toBe(
      "staff-email-error",
    );
    expect(wrapper.find(".staff-editor-error").exists()).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says what went wrong when the save fails, where a reader is told", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find(".staff-editor-error").exists()).toBe(true),
    );
    const error = wrapper.find(".staff-editor-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("The server is away.");
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(wrapper.find(".staff-editor-save").text()).toBe("Save");
  });

  it("deletes the member once asked", async () => {
    const fetch = vi.fn(async () => null);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const wrapper = mount(StaffEditor, { props: { record: STAFF } });
    await wrapper.find(".staff-editor-delete").trigger("click");
    await vi.waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/staff/1", { method: "DELETE" }),
    );
  });
});
