import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import { useRouter } from "#imports";
import { mountHeld } from "#test/support/drafts";
import { PERSON } from "#test/support/records";
import Select from "@zoobzio/vue/components/select.vue";
import PersonEditor from "~/components/PersonEditor.vue";

const value = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.find(`#${id}`).element as HTMLInputElement).value;

const select = (wrapper: ReturnType<typeof mount>, id: string) =>
  wrapper
    .findAllComponents(Select)
    .find((control) => control.find(`#${id}`).exists())!;

const choose = (wrapper: ReturnType<typeof mount>, id: string, value: string) =>
  select(wrapper, id).vm.$emit("update:modelValue", { value, label: value });

describe("PersonEditor", () => {
  it("opens blank for a new person, a person until given another role", () => {
    const wrapper = mount(PersonEditor, { props: { record: null } });
    expect(value(wrapper, "person-firstName")).toBe("");
    expect(value(wrapper, "person-lastName")).toBe("");
    expect(wrapper.find("#person-role").text()).toBe("Member");
    expect(wrapper.find("#person-status").exists()).toBe(false);
  });

  it("opens on a person's record, every field filled, with a save alone: the page's menu deletes", () => {
    const wrapper = mount(PersonEditor, { props: { record: PERSON } });
    expect(value(wrapper, "person-firstName")).toBe("Jane");
    expect(value(wrapper, "person-lastName")).toBe("Doe");
    expect(wrapper.find("#person-role").text()).toBe("Elder");
    expect(value(wrapper, "person-email")).toBe("jane@example.com");
    expect(value(wrapper, "person-summary")).toBe("Has served since 2010.");
    expect(wrapper.find("textarea#person-summary").exists()).toBe(true);
    expect(wrapper.find("textarea#person-address").exists()).toBe(true);
    expect(
      wrapper.findAll('button[type="submit"]').map((b) => b.text()),
    ).toEqual(["Save"]);
    expect(wrapper.find(".person-editor-delete").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Delete");
  });

  it("offers each role by name", () => {
    const wrapper = mount(PersonEditor, { props: { record: null } });
    expect(select(wrapper, "person-role").props("options")).toEqual([
      { value: "pastor", label: "Pastor" },
      { value: "elder", label: "Elder" },
      { value: "staff", label: "Staff" },
      { value: "member", label: "Member" },
    ]);
  });

  it("is one column of a person's details, their photo first, and no bio", () => {
    const wrapper = mount(PersonEditor, { props: { record: PERSON } });
    expect(
      wrapper.findAll(".f-data-form-field-label").map((label) => label.text()),
    ).toEqual([
      "Photo",
      "First name",
      "Last name",
      "Role",
      "Title",
      "Email",
      "Phone",
      "Address",
      "Birthday",
      "Summary",
    ]);
    expect(wrapper.find("#person-bio").exists()).toBe(false);
    expect(wrapper.find(".f-data-editor").exists()).toBe(false);
  });

  it("draws the photo of a person that exists among their fields: a round frame, their initials in it for none", async () => {
    const wrapper = mount(PersonEditor, { props: { record: PERSON } });
    const field = wrapper.find(".f-data-form-field");
    expect(field.find(".f-data-form-field-label").attributes("for")).toBe(
      "person-photo",
    );
    expect(field.find("input#person-photo").attributes()).toMatchObject({
      type: "file",
      accept: "image/jpeg,image/png,image/webp",
    });
    expect(field.find(".image-field").attributes("data-round")).toBe("true");
    const none = field.find(".f-image-input-placeholder");
    expect(none.text()).toBe("JD");
    expect(none.attributes("role")).toBeUndefined();
    expect(field.find("label.image-field-pick").attributes("title")).toBe(
      "Upload photo",
    );
    expect(field.find(".image-field-remove").exists()).toBe(false);

    const photo = "https://cdn.example.com/staff/jane-doe.jpg";
    const pictured = mount(PersonEditor, {
      props: { record: { ...PERSON, photo } },
    });
    expect(pictured.find(".image-field img").attributes("src")).toBe(photo);
    expect(pictured.find("label.image-field-pick").attributes("title")).toBe(
      "Change photo",
    );
    expect(
      pictured.find("button.image-field-remove").attributes("aria-label"),
    ).toBe("Remove photo");
  });

  it("draws no photo for a new person: there is nothing yet to write one to", () => {
    const wrapper = mount(PersonEditor, { props: { record: null } });
    expect(wrapper.find(".image-field").exists()).toBe(false);
    expect(wrapper.find("#person-photo").exists()).toBe(false);
  });

  it("labels every control", () => {
    const wrapper = mount(PersonEditor, { props: { record: null } });
    const labels = wrapper.findAll("label");
    expect(labels.length).toBe(9);
    for (const label of labels) {
      const id = label.attributes("for");
      expect(id).toBeDefined();
      expect(wrapper.find(`#${id}`).exists(), id).toBe(true);
    }
  });

  it("saves without the browser's own checks, and leaves the form's title to the page", () => {
    const wrapper = mount(PersonEditor, { props: { record: PERSON } });
    expect(wrapper.find("form").attributes("novalidate")).toBeDefined();
    expect(wrapper.find(".f-data-form-title").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Jane Doe");
  });

  it("writes what is typed as a new person", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(PersonEditor, { props: { record: null } });
    await wrapper.find("#person-firstName").setValue("John");
    await wrapper.find("#person-lastName").setValue("Roe");
    choose(wrapper, "person-role", "staff");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith("/api/people", {
      method: "POST",
      body: { firstName: "John", lastName: "Roe", role: "staff" },
    });
    await vi.waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith("/people/1/profile"),
    );
  });

  it("saves a person's details in place, and says who was saved", async () => {
    const changed = { ...PERSON, lastName: "Roe", name: "Jane Roe" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(PersonEditor, { props: { record: PERSON } });
    await wrapper.find("#person-lastName").setValue("Roe");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(wrapper.emitted("saved")).toBeTruthy());
    expect(wrapper.emitted("saved")).toEqual([[changed]]);
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: expect.objectContaining({ firstName: "Jane", lastName: "Roe" }),
    });
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(value(wrapper, "person-lastName")).toBe("Roe");
  });

  it("shows what is wrong with a draft, by its field, and stays open", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(PersonEditor, { props: { record: PERSON } });
    await wrapper.find("#person-email").setValue("jane");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find("#person-email-error").exists()).toBe(true),
    );
    expect(wrapper.find("#person-email").attributes("aria-invalid")).toBe(
      "true",
    );
    expect(wrapper.find("#person-email").attributes("aria-describedby")).toBe(
      "person-email-error",
    );
    expect(wrapper.find(".person-editor-error").exists()).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("says what went wrong when the save fails, where a reader is told", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const wrapper = mount(PersonEditor, { props: { record: PERSON } });
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(wrapper.find(".person-editor-error").exists()).toBe(true),
    );
    const error = wrapper.find(".person-editor-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("The server is away.");
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(wrapper.find(".person-editor-save").text()).toBe("Save");
  });

  it("leaves the save to the page that holds its record: no button of its own, the form handed in", async () => {
    const changed = { ...PERSON, lastName: "Roe", name: "Jane Roe" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const { wrapper, drafts } = mountHeld(PersonEditor, PERSON);
    expect(wrapper.find("button.person-editor-save").exists()).toBe(false);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
    expect(drafts.dirty.value).toBe(false);
    expect(drafts.open.value).toBe(false);
    await wrapper.find("#person-lastName").setValue("Roe");
    expect(drafts.dirty.value).toBe(true);
    expect(drafts.open.value).toBe(true);
    await drafts.save();
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {
      method: "PUT",
      body: expect.objectContaining({ firstName: "Jane", lastName: "Roe" }),
    });
    expect(drafts.dirty.value).toBe(false);
    expect(wrapper.findComponent(PersonEditor).emitted("saved")).toEqual([
      [changed],
    ]);
    expect(value(wrapper, "person-lastName")).toBe("Roe");
  });

  it("is put back as it was last saved when the page resets its record", async () => {
    const { wrapper, drafts } = mountHeld(PersonEditor, PERSON);
    await wrapper.find("#person-lastName").setValue("Roe");
    drafts.reset();
    await wrapper.vm.$nextTick();
    expect(value(wrapper, "person-lastName")).toBe("Doe");
    expect(drafts.dirty.value).toBe(false);
  });

  it("hands what went wrong with a save to the page's bar", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const { wrapper, drafts } = mountHeld(PersonEditor, PERSON);
    await wrapper.find("#person-lastName").setValue("Roe");
    await drafts.save();
    await wrapper.vm.$nextTick();
    expect(drafts.errors.value).toEqual(["The server is away."]);
    expect(drafts.dirty.value).toBe(true);
    expect(wrapper.find(".person-editor-error").exists()).toBe(false);
  });

  it("keeps its own save for a new person, whatever page it is drawn on", () => {
    const { wrapper, drafts } = mountHeld(PersonEditor, null);
    expect(wrapper.find("button.person-editor-save").text()).toBe("Save");
    expect(drafts.open.value).toBe(false);
  });
});
