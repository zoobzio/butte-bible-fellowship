import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { Avatar, FileInput } from "#components";
import { STAFF } from "#test/support/records";
import StaffAvatar from "~/components/StaffAvatar.vue";

const PHOTO = "https://store.public.blob.vercel-storage.com/staff/1-abc.png";

const PICTURED = { ...STAFF, photo: PHOTO };

/** What the upload badge is called: the input's name, and the badge's tip. */
const picking = (wrapper: ReturnType<typeof mount>) => {
  const name = wrapper.find("input").attributes("aria-label");
  expect(wrapper.find("label.staff-avatar-pick").attributes("title")).toBe(
    name,
  );
  return name;
};

const image = () =>
  new File([new Uint8Array(8)], "jane.png", { type: "image/png" });

describe("StaffAvatar", () => {
  it("stands a member's initials in for a photo they do not have, and offers an upload", () => {
    const wrapper = mount(StaffAvatar, { props: { record: STAFF } });
    expect(wrapper.findComponent(Avatar).props()).toMatchObject({
      src: "",
      alt: "",
      fallback: "JD",
    });
    expect(picking(wrapper)).toBe("Upload photo");
    expect(wrapper.find(".staff-avatar-remove").exists()).toBe(false);
  });

  it("shows the photo a member has, with a change and a remove", () => {
    const wrapper = mount(StaffAvatar, { props: { record: PICTURED } });
    expect(wrapper.findComponent(Avatar).props("src")).toBe(PHOTO);
    expect(picking(wrapper)).toBe("Change photo");
    const remove = wrapper.find("button.staff-avatar-remove");
    expect(remove.attributes("aria-label")).toBe("Remove photo");
    expect(remove.attributes("title")).toBe("Remove photo");
  });

  it("draws each control as a badge on the picture: an icon alone, named for a reader", () => {
    const wrapper = mount(StaffAvatar, { props: { record: PICTURED } });
    const frame = wrapper.find(".staff-avatar-frame");
    const badges = frame.findAll(".staff-avatar-badge");
    expect(badges.map((badge) => badge.text())).toEqual(["", ""]);
    expect(badges.map((badge) => badge.find("use").attributes("href"))).toEqual(
      ["#remove", "#camera"],
    );
    expect(
      badges.map((badge) => badge.find("svg").attributes("aria-hidden")),
    ).toEqual(["true", "true"]);
    expect(wrapper.text()).toBe("JD");
  });

  it("picks one image of a kind the schema takes, through an input its badge is the label of", () => {
    const wrapper = mount(StaffAvatar, { props: { record: STAFF } });
    const input = wrapper.find("input");
    expect(input.attributes()).toMatchObject({
      type: "file",
      accept: "image/jpeg,image/png,image/webp",
    });
    expect(input.attributes("multiple")).toBeUndefined();
    expect(wrapper.find("label.staff-avatar-pick").attributes("for")).toBe(
      input.attributes("id"),
    );
  });

  it("uploads the image as it is picked, apart from any form, and shows the photo kept", async () => {
    const fetch = vi.fn(async (..._: unknown[]) => PICTURED);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(StaffAvatar, { props: { record: STAFF } });
    expect(wrapper.find("form").exists()).toBe(false);
    const file = image();
    wrapper.findComponent(FileInput).vm.$emit("update:modelValue", [file]);
    await wrapper.vm.$nextTick();
    expect(picking(wrapper)).toBe("Uploading…");
    expect(wrapper.find(".staff-avatar-frame").attributes("aria-busy")).toBe(
      "true",
    );
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    // The file is on its way, not listed: there is nothing to remove yet.
    expect(
      wrapper.find(".f-file-input-item").attributes("hidden"),
    ).toBeDefined();
    await flushPromises();
    const [path, request] = fetch.mock.calls[0] as [
      string,
      { method: string; body: FormData },
    ];
    expect(path).toBe("/api/staff/1/avatar");
    expect(request.method).toBe("PATCH");
    expect(request.body.get("file")).toBe(file);
    expect(wrapper.findComponent(Avatar).props("src")).toBe(PHOTO);
    expect(picking(wrapper)).toBe("Change photo");
    expect(
      wrapper.find(".staff-avatar-frame").attributes("aria-busy"),
    ).toBeUndefined();
    expect(wrapper.find("input").attributes("disabled")).toBeUndefined();
  });

  it("says what is wrong with a file that is not a photo, where a reader is told", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(StaffAvatar, { props: { record: STAFF } });
    wrapper
      .findComponent(FileInput)
      .vm.$emit("update:modelValue", [
        new File(["x"], "jane.pdf", { type: "application/pdf" }),
      ]);
    await flushPromises();
    const error = wrapper.find(".staff-avatar-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toContain("Choose a JPEG, PNG or WebP image");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("removes the photo once asked", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const wrapper = mount(StaffAvatar, { props: { record: PICTURED } });
    await wrapper.find(".staff-avatar-remove").trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1/avatar", {
      method: "DELETE",
    });
    expect(wrapper.findComponent(Avatar).props("src")).toBe("");
    expect(wrapper.find(".staff-avatar-remove").exists()).toBe(false);
    expect(picking(wrapper)).toBe("Upload photo");
  });
});
