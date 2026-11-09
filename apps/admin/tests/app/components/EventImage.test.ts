import { describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { FileInput } from "#components";
import { WORSHIP } from "#test/support/records";
import EventImage from "~/components/EventImage.vue";

const PHOTO = "https://store.public.blob.vercel-storage.com/events/3-abc.png";

const PICTURED = { ...WORSHIP, image: PHOTO };

/** What the upload badge is called: the input's name, and the badge's tip. */
const picking = (wrapper: ReturnType<typeof mount>) => {
  const name = wrapper.find("input").attributes("aria-label");
  expect(wrapper.find("label.event-image-pick").attributes("title")).toBe(name);
  return name;
};

const image = () =>
  new File([new Uint8Array(8)], "jane.png", { type: "image/png" });

describe("EventImage", () => {
  it("stands a mark in for a picture an event does not have, named for a reader, and offers an upload", () => {
    const wrapper = mount(EventImage, { props: { record: WORSHIP } });
    expect(wrapper.find("img").exists()).toBe(false);
    const none = wrapper.find(".event-image-none");
    expect(none.attributes("role")).toBe("img");
    expect(none.attributes("aria-label")).toBe("No picture");
    expect(none.find("use").attributes("href")).toBe("#image");
    expect(picking(wrapper)).toBe("Upload picture");
    expect(wrapper.find(".event-image-remove").exists()).toBe(false);
  });

  it("shows the picture an event has, with a change and a remove", () => {
    const wrapper = mount(EventImage, { props: { record: PICTURED } });
    const picture = wrapper.find("img.event-image-picture");
    expect(picture.attributes("src")).toBe(PHOTO);
    expect(picture.attributes("alt")).toBe("");
    expect(wrapper.find(".event-image-none").exists()).toBe(false);
    expect(picking(wrapper)).toBe("Change picture");
    const remove = wrapper.find("button.event-image-remove");
    expect(remove.attributes("aria-label")).toBe("Remove picture");
    expect(remove.attributes("title")).toBe("Remove picture");
  });

  it("draws each control as a badge on the picture: an icon alone, named for a reader", () => {
    const wrapper = mount(EventImage, { props: { record: PICTURED } });
    const frame = wrapper.find(".event-image-frame");
    const badges = frame.findAll(".event-image-badge");
    expect(badges.map((badge) => badge.text())).toEqual(["", ""]);
    expect(badges.map((badge) => badge.find("use").attributes("href"))).toEqual(
      ["#remove", "#camera"],
    );
    expect(
      badges.map((badge) => badge.find("svg").attributes("aria-hidden")),
    ).toEqual(["true", "true"]);
    expect(wrapper.text()).toBe("");
  });

  it("picks one image of a kind the schema takes, through an input its badge is the label of", () => {
    const wrapper = mount(EventImage, { props: { record: WORSHIP } });
    const input = wrapper.find("input");
    expect(input.attributes()).toMatchObject({
      type: "file",
      accept: "image/jpeg,image/png,image/webp",
    });
    expect(input.attributes("multiple")).toBeUndefined();
    expect(wrapper.find("label.event-image-pick").attributes("for")).toBe(
      input.attributes("id"),
    );
  });

  it("uploads the image as it is picked, apart from any form, and shows the picture kept", async () => {
    const fetch = vi.fn(async (..._: unknown[]) => PICTURED);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(EventImage, { props: { record: WORSHIP } });
    expect(wrapper.find("form").exists()).toBe(false);
    const file = image();
    wrapper.findComponent(FileInput).vm.$emit("update:modelValue", [file]);
    await wrapper.vm.$nextTick();
    expect(picking(wrapper)).toBe("Uploading…");
    expect(wrapper.find(".event-image-frame").attributes("aria-busy")).toBe(
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
    expect(path).toBe("/api/events/3/image");
    expect(request.method).toBe("PATCH");
    expect(request.body.get("file")).toBe(file);
    expect(wrapper.find("img.event-image-picture").attributes("src")).toBe(
      PHOTO,
    );
    expect(picking(wrapper)).toBe("Change picture");
    expect(
      wrapper.find(".event-image-frame").attributes("aria-busy"),
    ).toBeUndefined();
    expect(wrapper.find("input").attributes("disabled")).toBeUndefined();
  });

  it("says what is wrong with a file that is not a picture, where a reader is told", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const wrapper = mount(EventImage, { props: { record: WORSHIP } });
    wrapper
      .findComponent(FileInput)
      .vm.$emit("update:modelValue", [
        new File(["x"], "jane.pdf", { type: "application/pdf" }),
      ]);
    await flushPromises();
    const error = wrapper.find(".event-image-error");
    expect(error.attributes("role")).toBe("alert");
    expect(error.text()).toContain("Choose a JPEG, PNG or WebP image");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("removes the picture once asked", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    vi.stubGlobal("confirm", () => true);
    const wrapper = mount(EventImage, { props: { record: PICTURED } });
    await wrapper.find(".event-image-remove").trigger("click");
    await flushPromises();
    expect(fetch).toHaveBeenCalledWith("/api/events/3/image", {
      method: "DELETE",
    });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".event-image-remove").exists()).toBe(false);
    expect(picking(wrapper)).toBe("Upload picture");
  });
});
