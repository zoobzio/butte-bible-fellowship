import { describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Dialog } from "#components";
import LeaveDialog from "~/components/LeaveDialog.vue";

/** The window, once what it portals to the body is drawn. */
const mountDialog = async (open = true) => {
  const wrapper = mount(LeaveDialog, {
    props: { open },
    attachTo: document.body,
  });
  await flushPromises();
  return wrapper;
};

const button = (name: string) =>
  document.body.querySelector<HTMLButtonElement>(`.leave-dialog-${name}`);

describe("LeaveDialog", () => {
  it("draws nothing until there is a move to answer for", async () => {
    const wrapper = await mountDialog(false);
    expect(wrapper.findComponent(Dialog).props("open")).toBe(false);
    expect(document.body.querySelector(".f-dialog-content")).toBeNull();
  });

  it("is a window that says what leaving loses, with a way to stay and a way to go", async () => {
    const wrapper = await mountDialog();
    expect(wrapper.findComponent(Dialog).props()).toMatchObject({
      open: true,
      title: "Unsaved changes",
      description:
        "If you leave now, the changes you have not saved will be lost.",
    });
    expect(document.body.querySelector("[role=dialog]")).not.toBeNull();
    expect(button("stay")?.textContent?.trim()).toBe("Keep editing");
    expect(button("leave")?.textContent?.trim()).toBe("Discard changes");
  });

  it("stays on its first button, and leaves on its second", async () => {
    const wrapper = await mountDialog();
    button("stay")!.click();
    expect(wrapper.emitted()).toEqual({ stay: [[]] });
    button("leave")!.click();
    expect(wrapper.emitted("leave")).toEqual([[]]);
  });

  it("stays when it is closed any other way", async () => {
    const wrapper = await mountDialog();
    wrapper.findComponent(Dialog).vm.$emit("update:open", false);
    expect(wrapper.emitted()).toEqual({ stay: [[]] });
  });
});
