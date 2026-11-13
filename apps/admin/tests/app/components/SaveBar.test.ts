import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import SaveBar from "~/components/SaveBar.vue";

const CLEAN = { dirty: false, open: false, saving: false };

const buttons = (wrapper: ReturnType<typeof mount>) => ({
  reset: wrapper.find("button.save-bar-reset"),
  save: wrapper.find("button.save-bar-save"),
});

describe("SaveBar", () => {
  it("offers a reset, then a save, neither of them a form's own, with nothing to do on a record as it was saved", () => {
    const wrapper = mount(SaveBar, { props: CLEAN });
    expect(wrapper.findAll("button").map((b) => b.text())).toEqual([
      "Reset",
      "Save",
    ]);
    const { reset, save } = buttons(wrapper);
    expect(reset.attributes("type")).toBe("button");
    expect(save.attributes("type")).toBe("button");
    expect(reset.attributes("disabled")).toBeDefined();
    expect(save.attributes("disabled")).toBeDefined();
    expect(wrapper.find(".save-bar-error").exists()).toBe(false);
  });

  it("saves and resets a record with a change, and says which was asked for", async () => {
    const wrapper = mount(SaveBar, {
      props: { ...CLEAN, dirty: true, open: true },
    });
    const { reset, save } = buttons(wrapper);
    expect(reset.attributes("disabled")).toBeUndefined();
    expect(save.attributes("disabled")).toBeUndefined();
    await save.trigger("click");
    expect(wrapper.emitted()).toMatchObject({ save: [[]] });
    expect(wrapper.emitted("reset")).toBeUndefined();
    await reset.trigger("click");
    expect(wrapper.emitted("reset")).toEqual([[]]);
  });

  it("only resets a record that is open with nothing changed", () => {
    const wrapper = mount(SaveBar, { props: { ...CLEAN, open: true } });
    const { reset, save } = buttons(wrapper);
    expect(reset.attributes("disabled")).toBeUndefined();
    expect(save.attributes("disabled")).toBeDefined();
  });

  it("says a save is under way, and does nothing more until it is done", () => {
    const wrapper = mount(SaveBar, {
      props: { dirty: true, open: true, saving: true },
    });
    const { reset, save } = buttons(wrapper);
    expect(save.text()).toBe("Saving…");
    expect(save.attributes("disabled")).toBeDefined();
    expect(reset.attributes("disabled")).toBeDefined();
  });

  it("says what went wrong, each failure where a reader is told", () => {
    const wrapper = mount(SaveBar, {
      props: {
        ...CLEAN,
        dirty: true,
        open: true,
        errors: ["Slug already taken.", "The server is away."],
      },
    });
    const errors = wrapper.findAll(".save-bar-error");
    expect(errors.map((error) => error.text())).toEqual([
      "Slug already taken.",
      "The server is away.",
    ]);
    expect(errors.map((error) => error.attributes("role"))).toEqual([
      "alert",
      "alert",
    ]);
  });
});
