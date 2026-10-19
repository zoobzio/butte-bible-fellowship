import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import RecordForm from "~/components/RecordForm.vue";

const mountForm = (
  props: Partial<InstanceType<typeof RecordForm>["$props"]> = {},
) =>
  mount(RecordForm, {
    props: {
      saving: false,
      removing: false,
      error: null,
      removable: true,
      ...props,
    },
    slots: { default: '<input class="field" />' },
  });

describe("RecordForm", () => {
  it("stands the controls in a form that saves on submit, without the browser's own checks", async () => {
    const wrapper = mountForm();
    const form = wrapper.find("form.record-form");
    expect(form.attributes("novalidate")).toBeDefined();
    expect(form.find(".record-form-fields .field").exists()).toBe(true);
    await form.trigger("submit");
    expect(wrapper.emitted("submit")).toHaveLength(1);
  });

  it("offers a delete when there is a record, and asks for it on click", async () => {
    const wrapper = mountForm();
    const remove = wrapper.find("button.record-form-delete");
    expect(remove.attributes("type")).toBe("button");
    await remove.trigger("click");
    expect(wrapper.emitted("remove")).toHaveLength(1);
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("offers no delete when there is no record", () => {
    expect(
      mountForm({ removable: false }).find(".record-form-delete").exists(),
    ).toBe(false);
  });

  it("waits while saving or deleting, and says which", () => {
    const saving = mountForm({ saving: true });
    expect(saving.find(".record-form-save").text()).toBe("Saving…");
    expect(
      saving.find(".record-form-save").attributes("disabled"),
    ).toBeDefined();
    expect(
      saving.find(".record-form-delete").attributes("disabled"),
    ).toBeDefined();
    const removing = mountForm({ removing: true });
    expect(removing.find(".record-form-delete").text()).toBe("Deleting…");
    expect(
      removing.find(".record-form-save").attributes("disabled"),
    ).toBeDefined();
    const idle = mountForm();
    expect(idle.find(".record-form-save").text()).toBe("Save");
    expect(
      idle.find(".record-form-save").attributes("disabled"),
    ).toBeUndefined();
  });

  it("says what went wrong, where a reader is told", () => {
    const wrapper = mountForm({ error: "slug: a slug" });
    const error = wrapper.find(".record-form-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toBe("slug: a slug");
    expect(mountForm().find(".record-form-error").exists()).toBe(false);
  });
});
