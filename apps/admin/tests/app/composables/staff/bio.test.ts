import { describe, expect, it, vi } from "vitest";

import { BIO, STAFF } from "#test/support/records";
import { useStaffBio } from "~/composables/staff/bio";

const paragraph = (value: string) => ({
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value }],
    },
  ],
});

/** Writes over the whole bio, as typing over a selection does. */
const write = (bio: ReturnType<typeof useStaffBio>, text: string) =>
  bio.editor.run((chain) => chain.selectAll().insertContent(text));

describe("useStaffBio", () => {
  it("is the bio's editor, on the record's bio as a page, not yet edited", () => {
    const bio = useStaffBio(STAFF);
    expect(bio.editor.id).toBe("staff-bio");
    expect(bio.editor.document).toBe("<p>Has served since 2010.</p>");
    expect(bio.editing.value).toBe(false);
    expect(bio.dirty.value).toBe(false);
    expect(bio.error.value).toBeNull();
  });

  it("opens empty for a member with no bio", () => {
    const { bio: _, ...bare } = STAFF;
    expect(useStaffBio(bare).editor.empty).toBe(true);
  });

  it("starts over from the record, whatever the last visit left", () => {
    write(useStaffBio(STAFF), "Someone else.");
    expect(useStaffBio(STAFF).editor.document).toBe(
      "<p>Has served since 2010.</p>",
    );
  });

  it("knows the bio has changed once it is written in", () => {
    const bio = useStaffBio(STAFF);
    write(bio, "Since 2010.");
    expect(bio.dirty.value).toBe(true);
    expect(bio.editor.document).toBe("<p>Since 2010.</p>");
  });

  it("saves the bio as a patch of its own, as the tree the site renders, and ends the edit", async () => {
    const fetch = vi.fn(async () => ({
      ...STAFF,
      bio: paragraph("Since 2010."),
    }));
    vi.stubGlobal("$fetch", fetch);
    const bio = useStaffBio(STAFF);
    write(bio, "Since 2010.");
    const saving = bio.save();
    expect(bio.saving.value).toBe(true);
    await saving;
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/staff/1/bio", {
      method: "PATCH",
      body: { bio: paragraph("Since 2010.") },
    });
    expect(bio.saving.value).toBe(false);
    expect(bio.dirty.value).toBe(false);
    expect(bio.view.value).toBe(1);
    expect(bio.editor.document).toBe("<p>Since 2010.</p>");
    expect(bio.error.value).toBeNull();
  });

  it("writes no bio once the editor is emptied", async () => {
    const { bio: _, ...bare } = STAFF;
    const fetch = vi.fn(async () => bare);
    vi.stubGlobal("$fetch", fetch);
    const bio = useStaffBio(STAFF);
    bio.editor.run((chain) => chain.clearContent(true));
    expect(bio.editor.empty).toBe(true);
    await bio.save();
    expect(fetch).toHaveBeenCalledWith("/api/staff/1/bio", {
      method: "PATCH",
      body: {},
    });
    expect(bio.editor.empty).toBe(true);
  });

  it("puts back what was last saved when the edit is cancelled", async () => {
    const fetch = vi.fn(async () => ({
      ...STAFF,
      bio: paragraph("Since 2010."),
    }));
    vi.stubGlobal("$fetch", fetch);
    const bio = useStaffBio(STAFF);
    write(bio, "A slip of the keys.");
    bio.cancel();
    expect(fetch).not.toHaveBeenCalled();
    expect(bio.editor.document).toBe("<p>Has served since 2010.</p>");
    expect(bio.dirty.value).toBe(false);
    expect(bio.view.value).toBe(1);

    write(bio, "Since 2010.");
    await bio.save();
    write(bio, "Another slip.");
    bio.cancel();
    expect(bio.editor.document).toBe("<p>Since 2010.</p>");
    expect(bio.view.value).toBe(3);
  });

  it("says what went wrong when the save fails, and stays open on what was written, until the next try", async () => {
    const fetch = vi.fn(async (): Promise<unknown> => {
      throw new Error("The server is away.");
    });
    vi.stubGlobal("$fetch", fetch);
    const bio = useStaffBio(STAFF);
    write(bio, "Since 2010.");
    await bio.save();
    expect(bio.error.value).toBe("The server is away.");
    expect(bio.saving.value).toBe(false);
    expect(bio.dirty.value).toBe(true);
    expect(bio.view.value).toBe(0);
    expect(bio.editor.document).toBe("<p>Since 2010.</p>");

    fetch.mockResolvedValueOnce({ ...STAFF, bio: BIO });
    await bio.save();
    expect(bio.error.value).toBeNull();
  });

  it("saves once at a time, and is not cancelled under a save", async () => {
    let answer = (_: unknown) => {};
    const fetch = vi.fn(
      () => new Promise<unknown>((resolve) => (answer = resolve)),
    );
    vi.stubGlobal("$fetch", fetch);
    const bio = useStaffBio(STAFF);
    write(bio, "Since 2010.");
    const first = bio.save();
    await bio.save();
    bio.cancel();
    expect(bio.view.value).toBe(0);
    expect(bio.editor.document).toBe("<p>Since 2010.</p>");
    answer({ ...STAFF, bio: paragraph("Since 2010.") });
    await first;
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(bio.view.value).toBe(1);
  });
});
