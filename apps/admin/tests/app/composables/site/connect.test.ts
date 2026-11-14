import { describe, expect, it, vi } from "vitest";

import { CONNECT_PAGE } from "#test/support/records";
import { useConnectEditor } from "~/composables/site/connect";

const { body: _, updatedAt: __, ...FILLED } = CONNECT_PAGE;

describe("useConnectEditor", () => {
  it("is the connect form, on the page's metadata: its header, then how to find and reach the church", () => {
    const editor = useConnectEditor(CONNECT_PAGE);
    expect(editor.form.id).toBe("connect");
    expect(
      editor.form.config.fields.map((field) => [field.key, field.type]),
    ).toEqual([
      ["title", "text"],
      ["description", "textarea"],
      ["address", "text"],
      ["phone", "text"],
      ["fax", "text"],
      ["email", "text"],
      ["hours", "textarea"],
    ]);
    expect(editor.form.payload).toEqual(FILLED);
  });

  it("names each field for the reader, says how the address and the hours are written, and needs a title and an address alone", () => {
    const { fields } = useConnectEditor(CONNECT_PAGE).form.config;
    expect(fields.map((field) => field.label)).toEqual([
      "Title",
      "Description",
      "Address",
      "Phone",
      "Fax",
      "Email",
      "Office hours",
    ]);
    expect(
      fields.filter((field) => field.hint).map((field) => field.key),
    ).toEqual(["address", "hours"]);
    expect(
      fields.filter((field) => field.required).map((field) => field.key),
    ).toEqual(["title", "address"]);
  });

  it("replaces the page's metadata, and stays on what was kept", async () => {
    const changed = { ...CONNECT_PAGE, phone: "530-555-0100" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const editor = useConnectEditor(CONNECT_PAGE);
    editor.form.set("phone", " 530-555-0100 ");
    expect(editor.dirty.value).toBe(true);
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/site/connect", {
      method: "PUT",
      body: { ...FILLED, phone: "530-555-0100" },
    });
    expect(editor.form.payload.phone).toBe("530-555-0100");
    expect(editor.dirty.value).toBe(false);
  });

  it("writes nothing of a line once it is cleared, and keeps the lines of the hours", async () => {
    const fetch = vi.fn(async () => CONNECT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useConnectEditor(CONNECT_PAGE);
    editor.form.set("fax", "  ");
    editor.form.set("email", "");
    expect(editor.form.payload.fax).toBeUndefined();
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/site/connect", {
      method: "PUT",
      body: { ...FILLED, fax: undefined, email: undefined },
    });
    expect(FILLED.hours.split("\n")).toHaveLength(2);
  });

  it("keeps the form open on a title or an address left blank", async () => {
    const fetch = vi.fn(async () => CONNECT_PAGE);
    vi.stubGlobal("$fetch", fetch);
    const editor = useConnectEditor(CONNECT_PAGE);
    editor.form.set("address", " ");
    await editor.save();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("address").error).toBeDefined();
    expect(editor.error.value).toBeNull();
  });

  it("puts back what was last saved", () => {
    const editor = useConnectEditor(CONNECT_PAGE);
    editor.form.set("title", "Find Us");
    editor.reset();
    expect(editor.form.payload).toEqual(FILLED);
    expect(editor.dirty.value).toBe(false);
  });
});
